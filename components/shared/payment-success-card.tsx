"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Printer,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { VerifiedProBadge } from "@/components/shared/verified-pro-badge"
import { api, ApiError } from "@/lib/api"
import { dispatchPaymentConfirmed } from "@/lib/payment-events"
import { cn } from "@/lib/utils"
import type { PaymentVerificationResult } from "@/types"
import styles from "./payment-success-card.module.css"

const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 30_000

function formatAmount(amount: number, currency: string) {
  const code = (currency || "usd").toUpperCase()
  try {
    return `${new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    }).format(amount)} ${code}`
  } catch {
    return `${amount.toFixed(2)} ${code}`
  }
}

function formatDateTime(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}

function formatDateOnly(value: string | null) {
  if (!value) return "Not specified"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not specified"
  // Booking preferred dates are stored at UTC midnight.
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in (body as Record<string, unknown>)) {
    return (body as { data: T }).data
  }
  return body as T
}

function DetailRow({
  label,
  value,
  mono,
  children,
}: {
  label: string
  value?: React.ReactNode
  mono?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className={styles.detailRow}>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={cn(styles.value, mono && "font-mono text-[13px] sm:text-sm")}>
        {children ?? value ?? "—"}
      </dd>
    </div>
  )
}

function SuccessSkeleton() {
  return (
    <div className={styles.page} aria-busy="true">
      <div className={styles.card}>
        <div className="mx-auto h-[4.5rem] w-[4.5rem] animate-pulse rounded-full bg-muted/60" />
        <div className="mx-auto mt-5 h-8 w-56 animate-pulse rounded bg-muted/60" />
        <div className="mx-auto mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-muted/50" />
        <div className="mt-8 space-y-4 border-t border-border pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="h-4 w-28 animate-pulse rounded bg-muted/50" />
              <div className="h-4 w-36 animate-pulse rounded bg-muted/60" />
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <div className="h-9 w-36 animate-pulse rounded-lg bg-muted/60" />
          <div className="h-9 w-32 animate-pulse rounded-lg bg-muted/50" />
        </div>
      </div>
    </div>
  )
}

function ErrorCard({
  title,
  message,
  backHref,
  backLabel,
  onRetry,
}: {
  title: string
  message: string
  backHref: string
  backLabel: string
  onRetry?: () => void
}) {
  return (
    <div className={styles.page}>
      <div className={styles.card} role="status" aria-live="polite">
        <div className="mx-auto flex size-[4.5rem] items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-10" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className={cn("mt-2 text-sm sm:text-base", styles.muted)}>{message}</p>
        <div className={cn(styles.actions, styles.noPrint)}>
          {onRetry ? (
            <Button onClick={onRetry} aria-label="Try again">
              Try again
            </Button>
          ) : null}
          <Button variant={onRetry ? "outline" : "default"} asChild>
            <Link href={backHref} aria-label={backLabel}>
              {backLabel}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function PaymentSuccessCard({
  sessionId,
  backHref,
  backLabel,
}: {
  sessionId: string | null
  backHref: string
  backLabel: string
}) {
  const [result, setResult] = useState<PaymentVerificationResult | null>(null)
  const [loading, setLoading] = useState(Boolean(sessionId))
  const [error, setError] = useState<string | null>(null)
  const [timedOut, setTimedOut] = useState(false)
  const [copied, setCopied] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const confirmedRef = useRef(false)
  const router = useRouter()

  const verify = useCallback(async () => {
    if (!sessionId) return
    const body = await api.get<{ data: PaymentVerificationResult }>(
      `/api/payments/verify?session_id=${encodeURIComponent(sessionId)}`
    )
    return unwrap<PaymentVerificationResult>(body)
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) return
    let active = true
    let pollTimer: ReturnType<typeof setTimeout> | null = null
    const startedAt = Date.now()

    async function run() {
      try {
        const data = await verify()
        if (!active || !data) return
        setResult(data)
        setLoading(false)
        setError(null)

        if (data.status === "paid") {
          setTimedOut(false)
          if (!confirmedRef.current) {
            confirmedRef.current = true
            dispatchPaymentConfirmed(data.type)
            router.refresh()
          }
          return
        }
        if (data.status === "failed") {
          setTimedOut(false)
          return
        }
        // Pending: keep polling until the webhook updates the DB or we time out.
        if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
          setTimedOut(true)
          return
        }
        pollTimer = setTimeout(run, POLL_INTERVAL_MS)
      } catch (e) {
        if (!active) return
        setLoading(false)
        setTimedOut(false)
        setError(e instanceof ApiError ? e.message : "We couldn't verify this payment.")
      }
    }

    // Defer state updates out of the effect body to avoid cascading renders.
    void Promise.resolve().then(() => {
      setLoading(true)
      setError(null)
      setTimedOut(false)
      confirmedRef.current = false
      void run()
    })

    return () => {
      active = false
      if (pollTimer) clearTimeout(pollTimer)
    }
  }, [sessionId, verify, refreshKey, router])

  const retry = () => setRefreshKey((key) => key + 1)

  async function copyTransactionId() {
    const id = result?.transactionId
    if (!id) return
    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      toast.success("Copied")
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Could not copy the transaction ID")
    }
  }

  if (!sessionId) {
    return (
      <ErrorCard
        title="Payment could not be verified"
        message="A checkout session ID is missing. Please return and try your payment again."
        backHref={backHref}
        backLabel={backLabel}
      />
    )
  }

  if (loading) return <SuccessSkeleton />

  if (error) {
    return (
      <ErrorCard
        title="Payment could not be verified"
        message={error}
        backHref={backHref}
        backLabel={backLabel}
        onRetry={retry}
      />
    )
  }

  if (!result) {
    return (
      <ErrorCard
        title="Payment could not be verified"
        message="We couldn't load the payment details. Please try again."
        backHref={backHref}
        backLabel={backLabel}
        onRetry={retry}
      />
    )
  }

  if (result.status === "failed") {
    return (
      <ErrorCard
        title="Payment failed"
        message="This payment was not completed. No charges were made."
        backHref={backHref}
        backLabel={backLabel}
      />
    )
  }

  if (result.status === "pending") {
    return (
      <div className={styles.page}>
        <div className={styles.card} role="status" aria-live="polite">
          <div className="mx-auto flex size-[4.5rem] items-center justify-center rounded-full bg-primary/10 text-primary">
            <Loader2 className="size-10 animate-spin" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
            {timedOut ? "Payment received" : "Confirming your payment..."}
          </h1>
          <p className={cn("mt-2 text-sm sm:text-base", styles.muted)}>
            {timedOut
              ? "Payment received, your account will update shortly."
              : "Please wait while we confirm your payment with Stripe. This usually takes a few seconds."}
          </p>
          {!timedOut ? (
            <p className={cn("mt-4 text-xs", styles.muted)}>Checking every 2 seconds…</p>
          ) : null}
          <div className={cn(styles.actions, styles.noPrint)}>
            <Button asChild>
              <Link href={backHref} aria-label={backLabel}>
                {backLabel}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isBooking = result.type === "booking"
  const primaryAction = isBooking
    ? { href: "/dashboard/customer/bookings", label: "View my bookings" }
    : { href: "/dashboard/technician/my-services", label: "Add a service" }
  const secondaryAction = isBooking
    ? { href: "/dashboard/customer", label: "Back to dashboard" }
    : { href: "/dashboard/technician/subscription", label: "Manage subscription" }

  return (
    <div className={styles.page}>
      <article className={styles.card} role="status" aria-live="polite">
        <div className={styles.checkCircle} aria-hidden="true">
          <CheckCircle2 className={cn("size-10", styles.checkIcon)} />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">Payment successful</h1>
        <p className={cn("mt-2 text-sm sm:text-base", styles.muted)}>
          Thank you! Your payment has been received.
        </p>

        <dl className={styles.details}>
          <DetailRow label="Transaction ID" mono>
            <span className="flex items-center justify-end gap-2">
              <span className="break-all">{result.transactionId || "—"}</span>
              {result.transactionId ? (
                <button
                  type="button"
                  onClick={() => void copyTransactionId()}
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Copy transaction ID"
                  title="Copy transaction ID"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                </button>
              ) : null}
            </span>
          </DetailRow>
          <DetailRow label="Amount paid" value={formatAmount(result.amount, result.currency)} />
          <DetailRow label="Payment method" value={result.paymentMethod || "Card"} />
          <DetailRow label="Date and time" value={formatDateTime(result.paidAt)} />
          <DetailRow label="Status">
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
              Paid
            </span>
          </DetailRow>

          {isBooking && result.booking ? (
            <>
              <DetailRow label="Ticket #" mono value={result.booking.ticketId} />
              <DetailRow label="Service" value={result.booking.serviceTitle} />
              <DetailRow label="Technician" value={result.booking.technicianName} />
              <DetailRow
                label="Preferred date"
                value={formatDateOnly(result.booking.preferredDate)}
              />
              <DetailRow label="Address" value={result.booking.address} />
            </>
          ) : null}

          {!isBooking && result.subscription ? (
            <>
              <DetailRow label="Plan" value="Pro Technician" />
              <DetailRow
                label="Billing interval"
                value={
                  result.subscription.interval.charAt(0).toUpperCase() +
                  result.subscription.interval.slice(1)
                }
              />
              <DetailRow
                label="Next renewal date"
                value={formatDateOnly(result.subscription.renewalDate)}
              />
              <DetailRow label="Plan status">
                <VerifiedProBadge />
              </DetailRow>
            </>
          ) : null}
        </dl>

        <div className={cn(styles.actions, styles.noPrint)}>
          <Button asChild>
            <Link href={primaryAction.href} aria-label={primaryAction.label}>
              {primaryAction.label}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={secondaryAction.href} aria-label={secondaryAction.label}>
              {secondaryAction.label}
            </Link>
          </Button>
          {result.receiptUrl ? (
            <Button variant="outline" asChild>
              <a
                href={result.receiptUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Download receipt"
              >
                <Download className="size-4" />
                Download receipt
                <ExternalLink className="size-3.5 opacity-70" />
              </a>
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => window.print()} aria-label="Print receipt">
            <Printer className="size-4" />
            Print
          </Button>
        </div>
      </article>
    </div>
  )
}
