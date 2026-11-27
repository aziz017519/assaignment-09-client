"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { LoaderCircle, RefreshCw } from "lucide-react"

import { StarRating } from "@/components/reviews/star-rating"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { fetchServiceReviews } from "@/lib/review-api"
import type { ServiceReview } from "@/types"

const PAGE_SIZE = 5
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date)
}

function firstName(value?: string | null) {
  const name = value?.trim()
  if (!name) return "Customer"
  return name.split(/\s+/)[0]
}

export function ReviewsSection({
  serviceId,
  ratingCount,
}: {
  serviceId: string
  ratingCount?: number | string | null
}) {
  const [reviews, setReviews] = useState<ServiceReview[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const load = useCallback(
    async (nextPage: number, append: boolean) => {
      if (append) setLoadingMore(true)
      else setLoading(true)
      setError(null)
      try {
        const result = await fetchServiceReviews(serviceId, nextPage, PAGE_SIZE)
        if (!mountedRef.current) return
        setReviews((current) => (append ? [...current, ...result.data] : result.data))
        setPage(result.page)
        setTotalPages(Math.max(1, result.totalPages))
      } catch (err) {
        if (!mountedRef.current) return
        setError(
          err instanceof Error && err.message
            ? err.message
            : "Could not load reviews. Please try again."
        )
      } finally {
        if (mountedRef.current) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    },
    [serviceId]
  )

  useEffect(() => {
    void Promise.resolve().then(() => load(1, false))
  }, [load, reloadKey])

  const count = ratingCount ? Number(ratingCount) : reviews.length

  return (
    <section className="mt-12 border-t pt-8" aria-labelledby="service-reviews-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="service-reviews-heading" className="text-xl font-semibold">
          Reviews
        </h2>
        {Number.isFinite(count) && count > 0 ? (
          <p className="text-sm text-muted-foreground">
            {count} {count === 1 ? "review" : "reviews"}
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-6 space-y-3" aria-busy="true">
          <div className="h-24 animate-pulse rounded-xl border bg-muted/40" />
          <div className="h-24 animate-pulse rounded-xl border bg-muted/40" />
        </div>
      ) : null}

      {!loading && error && reviews.length === 0 ? (
        <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p>{error}</p>
          <Button
            className="mt-3"
            variant="outline"
            size="sm"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </Button>
        </div>
      ) : null}

      {!loading && !error && reviews.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No reviews yet"
          description="Reviews from completed repair bookings will appear here."
        />
      ) : null}

      {!loading && reviews.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {reviews.map((review, index) => (
            <li
              key={`${review.reviewedAt ?? "review"}-${index}`}
              className="rounded-xl border bg-card p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{firstName(review.customerName)}</p>
                <time
                  dateTime={review.reviewedAt ?? undefined}
                  className="text-xs text-muted-foreground"
                >
                  {formatDate(review.reviewedAt)}
                </time>
              </div>
              <StarRating
                rating={review.rating}
                showCount={false}
                size="sm"
                className="mt-2"
              />
              {review.review ? (
                <p className="mt-2 whitespace-pre-line break-words text-sm text-muted-foreground">
                  {review.review}
                </p>
              ) : (
                <p className="mt-2 text-sm italic text-muted-foreground">
                  No written review.
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {error && reviews.length > 0 ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {!loading && reviews.length > 0 && page < totalPages ? (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            disabled={loadingMore}
            onClick={() => void load(page + 1, true)}
          >
            {loadingMore ? (
              <>
                <LoaderCircle className="animate-spin" aria-hidden="true" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw aria-hidden="true" />
                Load more
              </>
            )}
          </Button>
        </div>
      ) : null}
    </section>
  )
}
