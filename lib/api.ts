type ApiOptions = RequestInit & { auth?: boolean }

export class ApiError extends Error {
  status: number
  data: unknown
  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
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

async function getApiToken(): Promise<string | null> {
  if (cachedToken && Date.now() < cachedTokenExpiresAt) return cachedToken
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
  const { auth = true, headers, ...rest } = options
  const url = path.startsWith("http") ? path : `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`

  const finalHeaders = new Headers(headers)
  if (!finalHeaders.has("Content-Type") && !(rest.body instanceof FormData)) {
    finalHeaders.set("Content-Type", "application/json")
  }

  if (auth && !finalHeaders.has("Authorization")) {
    const token = await getApiToken()
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`)
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
  })

  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

  if (!res.ok) {
    if (res.status === 401 && auth) clearApiToken()
    const message =
      (data && typeof data === "object" && "message" in data && typeof (data as any).message === "string"
        ? (data as any).message
        : null) ||
      (res.status === 401
        ? "Authentication required. Please sign in again."
        : res.status === 403
          ? "You do not have permission to perform this action."
          : "Request failed")
    throw new ApiError(message, res.status, data)
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
