"use client"

import { useCallback, useEffect, useState } from "react"
import { CreditCard, Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { ReviewModal } from "@/components/reviews/review-modal"
import { StarRating } from "@/components/reviews/star-rating"
import { EmptyState } from "@/components/shared/empty-state"
import { PaymentBadge } from "@/components/shared/payment-badge"
import { api, ApiError } from "@/lib/api"
import { downloadInvoicePdf } from "@/lib/invoice"
import { onPaymentConfirmed } from "@/lib/payment-events"
import {
  reviewErrorMessage,
  submitBookingReview,
} from "@/lib/review-api"
import { toRatingNumber } from "@/lib/service-display"
import type { Booking, Payment } from "@/types"

type BookingReviewInfo = Pick<
  Booking,
  "_id" | "id" | "serviceTitle" | "rating" | "review" | "reviewedAt" | "canReview"
>

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatAmount(payment: Payment) {
  const currency = (payment.currency || "usd").toUpperCase()
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(payment.amount)
  } catch {
    return `${payment.amount.toFixed(2)} ${currency}`
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date)
}

function bookingKey(booking: BookingReviewInfo) {
  return booking._id || booking.id || ""
}

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [bookingReviews, setBookingReviews] = useState<Record<string, BookingReviewInfo>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [reviewTarget, setReviewTarget] = useState<BookingReviewInfo | null>(null)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // The payments endpoint has no rating flags, so join the customer's
      // bookings locally. A bookings failure must not hide payment history.
      const [paymentsBody, bookings] = await Promise.all([
        api.get<{ data: Payment[] }>("/api/payments/my"),
        api
          .get<{ data: BookingReviewInfo[] }>("/api/bookings/my")
          .then((body) => (Array.isArray(body?.data) ? body.data : []))
          .catch(() => [] as BookingReviewInfo[]),
      ])
      setPayments(Array.isArray(paymentsBody?.data) ? paymentsBody.data : [])
      const byId: Record<string, BookingReviewInfo> = {}
      for (const booking of bookings) {
        const id = bookingKey(booking)
        if (id) byId[id] = booking
      }
      setBookingReviews(byId)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load payments"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(load)
    const onFocus = () => void load()
    const stopListening = onPaymentConfirmed((detail) => {
      if (detail.type === "booking") void load()
    })
    window.addEventListener("focus", onFocus)
    return () => {
      window.removeEventListener("focus", onFocus)
      stopListening()
    }
  }, [load])

  async function downloadInvoice(bookingId: string, key: string) {
    setBusyId(key)
    try {
      await downloadInvoicePdf(bookingId)
      toast.success("Invoice downloaded")
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : "Could not download the invoice."
      )
    } finally {
      setBusyId(null)
    }
  }

  async function submitReview({ rating, review }: { rating: number; review: string }) {
    if (!reviewTarget) return
    const bookingId = bookingKey(reviewTarget)
    if (!bookingId) return
    setReviewSubmitting(true)
    try {
      const result = await submitBookingReview(bookingId, rating, review)
      setBookingReviews((current) => ({
        ...current,
        [bookingId]: {
          ...(current[bookingId] ?? reviewTarget),
          _id: current[bookingId]?._id ?? bookingId,
          rating: result.rating,
          review: result.review ?? review ?? null,
          reviewedAt: result.reviewedAt ?? new Date().toISOString(),
          canReview: false,
        },
      }))
      toast.success("Review submitted. Thank you for your feedback!")
      setReviewTarget(null)
    } catch (err) {
      const status = err instanceof ApiError ? err.status : null
      if (status === 409) {
        setBookingReviews((current) => ({
          ...current,
          [bookingId]: {
            ...(current[bookingId] ?? reviewTarget),
            _id: current[bookingId]?._id ?? bookingId,
            canReview: false,
            reviewedAt: current[bookingId]?.reviewedAt ?? new Date().toISOString(),
          },
        }))
        setReviewTarget(null)
      } else if (status === 403) {
        setReviewTarget(null)
      }
      toast.error(
        reviewErrorMessage(err, "Could not submit your review. Please try again.")
      )
    } finally {
      setReviewSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground">
            Your completed Stripe payments, invoices, and transaction details.
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={loading} onClick={() => void load()}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          <div className="h-28 animate-pulse rounded-xl border bg-muted/40" />
          <div className="h-28 animate-pulse rounded-xl border bg-muted/40" />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p>{error}</p>
          <Button className="mt-3" variant="outline" size="sm" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : null}

      {!loading && !error && payments.length === 0 ? (
        <EmptyState
          title="No payments yet"
          description="Completed payments will be listed here after successful checkout."
        />
      ) : null}

      {!loading && !error && payments.length > 0 ? (
        <ul className="space-y-3">
          {payments.map((payment, index) => {
            const key = payment.id || payment._id || `payment-${index}`
            const bookingId = payment.bookingId ?? undefined
            const booking = bookingId ? bookingReviews[bookingId] : undefined
            const paid = (payment.status || payment.paymentStatus) === "paid"
            const canReview = Boolean(paid && booking?.canReview)
            const hasReview =
              toRatingNumber(booking?.rating) > 0 || Boolean(booking?.reviewedAt)

            return (
              <li key={key} className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CreditCard className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="break-words font-medium">
                        {payment.serviceTitle || booking?.serviceTitle || "Booking payment"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {payment.technicianName ? `${payment.technicianName} · ` : ""}
                        {formatDate(payment.paidAt ?? payment.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PaymentBadge status={payment.status || payment.paymentStatus || "paid"} />
                    <p className="font-semibold">{formatAmount(payment)}</p>
                  </div>
                </div>

                <dl className="mt-4 grid gap-3 border-t pt-3 text-sm sm:grid-cols-2">
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">Transaction ID</dt>
                    <dd className="mt-0.5 break-all font-mono text-[13px]">
                      {payment.transactionId || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Receipt</dt>
                    <dd className="mt-0.5">
                      {payment.receiptUrl ? (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            aria-label="View receipt"
                          >
                            View receipt
                          </a>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">Not available</span>
                      )}
                    </dd>
                  </div>
                </dl>

                {hasReview ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Your review</span>
                    {toRatingNumber(booking?.rating) > 0 ? (
                      <StarRating
                        rating={booking?.rating}
                        showCount={false}
                        size="sm"
                      />
                    ) : (
                      <span className="text-xs font-medium">Review submitted</span>
                    )}
                  </div>
                ) : null}

                {paid && bookingId ? (
                  <div className="mt-4 flex flex-col gap-2 border-t pt-3 sm:flex-row">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyId === key}
                      onClick={() => void downloadInvoice(bookingId, key)}
                    >
                      <Download aria-hidden="true" />
                      {busyId === key ? "Preparing invoice..." : "Download invoice"}
                    </Button>
                    {canReview ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setReviewTarget({
                            ...(booking ?? {}),
                            _id: bookingId,
                            serviceTitle: payment.serviceTitle || booking?.serviceTitle,
                          })
                        }
                      >
                        Rate &amp; Review
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}

      <ReviewModal
        open={Boolean(reviewTarget)}
        booking={reviewTarget}
        submitting={reviewSubmitting}
        onSubmit={(value) => void submitReview(value)}
        onClose={() => {
          if (!reviewSubmitting) setReviewTarget(null)
        }}
      />
    </div>
  )
}
