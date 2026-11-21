type ApiOptions = RequestInit & { auth?: boolean; _retried?: boolean }

export class ApiError extends Error {
  status: number
  data: unknown
  code?: string
  constructor(message: string, status: number, data: unknown, code?: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
    this.code = code
  }
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
}

// Short-lived token minted from the BetterAuth session by /api/token.
// Cached in memory so each dashboard request does not hit the token route.
let cachedToken: string | null = null
let cachedTokenExpiresAt = 0

export function clearApiToken() {
  cachedToken = null
  cachedTokenExpiresAt = 0
}

async function getApiToken(force = false): Promise<string | null> {
  if (!force && cachedToken && Date.now() < cachedTokenExpiresAt) return cachedToken
  try {
    const res = await fetch("/api/token", {
      credentials: "same-origin",
      cache: "no-store",
    })
    if (!res.ok) return null
    const body = await res.json()
    if (typeof body?.token !== "string" || !body.token) return null
    cachedToken = body.token
    cachedTokenExpiresAt = Date.now() + Math.max(1, Number(body.expiresIn) || 300) * 1000 - 30_000
    return cachedToken
  } catch {
    return null
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { auth = true, headers, _retried = false, ...rest } = options
  const url = path.startsWith("http") ? path : `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`

  const finalHeaders = new Headers(headers)
  if (!finalHeaders.has("Content-Type") && !(rest.body instanceof FormData)) {
    finalHeaders.set("Content-Type", "application/json")
  }

  let tokenUsed: string | null = null
  if (auth && !finalHeaders.has("Authorization")) {
    tokenUsed = await getApiToken()
    if (tokenUsed) finalHeaders.set("Authorization", `Bearer ${tokenUsed}`)
  }

  // The Express API authenticates via the Bearer token, not cookies, and its
  // CORS policy does not allow credentials. Keep cookies for same-origin calls.
  const isCrossOrigin =
    typeof window !== "undefined" &&
    /^https?:\/\//i.test(url) &&
    new URL(url).origin !== window.location.origin

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    credentials: isCrossOrigin ? "omit" : "same-origin",
    // Payment/plan state changes in the background via webhooks. Cached GETs
    // could otherwise keep a stale "pending" or "free" response on screen.
    cache: "no-store",
  })

  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

  if (!res.ok) {
    if (res.status === 401 && auth) {
      clearApiToken()
      // A cached token may have expired between requests. Mint a fresh one and
      // retry exactly once before treating the session as invalid.
      if (!_retried) {
        const fresh = await getApiToken(true)
        if (fresh && fresh !== tokenUsed) {
          const retryHeaders = new Headers(finalHeaders)
          retryHeaders.set("Authorization", `Bearer ${fresh}`)
          return apiFetch<T>(path, { ...options, headers: retryHeaders, _retried: true })
        }
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("api:unauthorized"))
      }
    } else if (res.status === 403 && typeof window !== "undefined") {
      // Central handling for role/permission errors; pages stay status-agnostic.
      window.dispatchEvent(new CustomEvent("api:forbidden"))
    }
    const payload = data && typeof data === "object" ? (data as Record<string, unknown>) : null
    const serverMessage =
      typeof payload?.message === "string"
        ? payload.message
        : typeof payload?.error === "string"
          ? payload.error
          : null
    const serverCode = typeof payload?.code === "string" ? payload.code : undefined
    const message =
      serverMessage ||
      (typeof data === "string" && data.trim() ? data.trim() : null) ||
      (res.status === 401
        ? "Authentication required. Please sign in again."
        : res.status === 403
          ? "You do not have permission to perform this action."
          : "Request failed")
    throw new ApiError(message, res.status, data, serverCode)
  }

  return data as T
}

export const api = {
  get: <T = unknown>(path: string, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T = unknown>(path: string, body?: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T = unknown>(path: string, body?: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T = unknown>(path: string, body?: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T = unknown>(path: string, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
}
