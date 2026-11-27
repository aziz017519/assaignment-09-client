import { api, ApiError } from "@/lib/api"
import type { ReviewResult, ServiceReview } from "@/types"

export interface ServiceReviewsPage {
  data: ServiceReview[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/** Express sendSuccess() wraps payloads in { success, data }. */
export function unwrapApiData<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body) {
    const data = (body as Record<string, unknown>).data
    if (data !== null && typeof data === "object") return data as T
  }
  return body as T
}

export async function fetchServiceReviews(
  serviceId: string,
  page: number,
  limit = 5
): Promise<ServiceReviewsPage> {
  const body = await api.get(
    `/api/services/${encodeURIComponent(serviceId)}/reviews?page=${page}&limit=${limit}`,
    { auth: false }
  )
  const payload = unwrapApiData<Partial<ServiceReviewsPage>>(body)
  const items = Array.isArray(payload?.data) ? payload.data : []
  const total = Number(payload?.total ?? items.length)
  const totalPages = Number(
    payload?.totalPages ?? Math.max(1, Math.ceil(total / Math.max(1, limit)))
  )

  return {
    data: items,
    total: Number.isFinite(total) ? total : items.length,
    page: Number(payload?.page ?? page) || page,
    limit: Number(payload?.limit ?? limit) || limit,
    totalPages: Number.isFinite(totalPages) ? totalPages : 1,
  }
}

export async function submitBookingReview(
  bookingId: string,
  rating: number,
  review?: string
): Promise<ReviewResult> {
  const trimmed = review?.trim()
  const body = await api.post(
    `/api/bookings/${encodeURIComponent(bookingId)}/review`,
    { rating, ...(trimmed ? { review: trimmed } : {}) }
  )
  return unwrapApiData<ReviewResult>(body)
}

export function reviewErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 409) return "This booking has already been reviewed."
    if (error.status === 403) return "You can only review your own bookings."
    if (error.status === 400) {
      return error.message || "Only paid bookings can be reviewed."
    }
    return error.message || fallback
  }
  return error instanceof Error && error.message ? error.message : fallback
}
