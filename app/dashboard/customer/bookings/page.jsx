"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { onPaymentConfirmed } from "@/lib/payment-events"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { BookingCard, BookingCardSkeleton } from "@/components/shared/booking-card"

function errorMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback
}

// Express sendSuccess() wraps lists in { success, data: [...] }.
function asArray(body) {
  const raw = body && typeof body === "object" && "data" in body ? body.data : body
  return Array.isArray(raw) ? raw : []
}

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const loadBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const body = await api.get("/api/bookings/my")
      const list = asArray(body)
      // Newest first, with _id as a stable tie-breaker (same as the API sort).
      list.sort((a, b) => {
        const timeDiff = new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        return timeDiff || String(b._id || b.id || "").localeCompare(String(a._id || a.id || ""))
      })
      setBookings(list)
    } catch (err) {
      // Keep failure distinct from a genuinely empty list.
      setBookings([])
      setError(errorMessage(err, "Could not load your bookings."))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    const load = () => {
      if (active) void loadBookings()
    }
    // Defer state updates out of the effect body to avoid cascading renders.
    void Promise.resolve().then(load)
    const onFocus = () => load()
    const stopListening = onPaymentConfirmed((detail) => {
      if (detail.type === "booking") load()
    })
    window.addEventListener("focus", onFocus)
    return () => {
      active = false
      window.removeEventListener("focus", onFocus)
      stopListening()
    }
  }, [loadBookings, reloadKey])

  const retry = () => setReloadKey((key) => key + 1)

  async function cancelBooking(id) {
    if (!window.confirm("Cancel this repair request? This cannot be undone.")) return
    setBusyId(id)
    try {
      await api.patch(`/api/bookings/${encodeURIComponent(id)}/cancel`)
      toast.success("Repair request cancelled")
      retry()
    } catch (err) {
      toast.error(errorMessage(err, "Could not cancel this request."))
    } finally {
      setBusyId(null)
    }
  }

  async function payNow(id) {
    setBusyId(id)
    try {
      const body = await api.post("/api/payments/create-checkout-session", { bookingId: id })
      const data = body && typeof body === "object" && "data" in body ? body.data : body
      if (!data || typeof data.url !== "string" || !data.url) {
        throw new Error("Payment did not return a checkout URL")
      }
      window.location.assign(data.url)
    } catch (err) {
      toast.error(errorMessage(err, "Could not start payment."))
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">
          View and manage your repair requests. Cancel is available only when status is requested.
          Pay Now appears only when completed and unpaid.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium">Could not load your bookings</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={retry}>
            Try again
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-4" aria-busy="true">
          <BookingCardSkeleton />
          <BookingCardSkeleton />
        </div>
      ) : null}

      {!loading && !error && bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="When you request a repair, your bookings will appear here with status and payment actions."
          action={
            <Button asChild>
              <Link href="/services">Browse services</Link>
            </Button>
          }
        />
      ) : null}

      {!loading && !error && bookings.length > 0 ? (
        <ul className="space-y-4">
          {bookings.map((booking, index) => {
            const id = booking._id || booking.id

            return (
              <li key={id || `booking-${index}`}>
                <BookingCard
                  booking={booking}
                  busy={busyId === id}
                  onCancel={() => void cancelBooking(id)}
                  onPay={() => void payNow(id)}
                />
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
