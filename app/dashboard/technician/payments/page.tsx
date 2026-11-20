"use client"

import { useCallback, useEffect, useState } from "react"
import { CreditCard, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { api } from "@/lib/api"
import { onPaymentConfirmed } from "@/lib/payment-events"
import type { TechnicianPayment } from "@/types"

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatAmount(payment: TechnicianPayment) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: payment.currency.toUpperCase(),
  }).format(payment.amount)
}

function formatDate(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date)
}

export default function TechnicianPaymentsPage() {
  const [payments, setPayments] = useState<TechnicianPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const body = await api.get<{ data: TechnicianPayment[] }>("/api/subscription/payments")
      setPayments(Array.isArray(body?.data) ? body.data : [])
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
    const stopListening = onPaymentConfirmed(() => {
      void load()
    })
    window.addEventListener("focus", onFocus)
    return () => {
      window.removeEventListener("focus", onFocus)
      stopListening()
    }
  }, [load])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground">Booking payments and your Pro subscription receipts.</p>
        </div>
        <Button variant="outline" size="sm" disabled={loading} onClick={() => void load()}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          <div className="h-20 animate-pulse rounded-xl border bg-muted/40" />
          <div className="h-20 animate-pulse rounded-xl border bg-muted/40" />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p>{error}</p>
          <Button className="mt-3" variant="outline" size="sm" onClick={() => void load()}>Try again</Button>
        </div>
      ) : null}

      {!loading && !error && payments.length === 0 ? (
        <EmptyState
          title="No payments yet"
          description="Completed booking payments and Pro subscription receipts will appear here."
        />
      ) : null}

      {!loading && !error && payments.length > 0 ? (
        <ul className="space-y-3">
          {payments.map((payment) => (
            <li
              key={payment.id}
              className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CreditCard className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="break-words font-medium">
                      {payment.type === "subscription" ? "Pro subscription" : payment.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(payment.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatAmount(payment)}</p>
                  <p className="text-xs capitalize text-muted-foreground">{payment.status}</p>
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
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
