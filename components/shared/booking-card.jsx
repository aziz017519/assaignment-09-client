import { Button } from "@/components/ui/button"
import { ServiceImage } from "@/components/shared/service-image"
import { StatusBadge } from "@/components/shared/status-badge"
import { PaymentBadge } from "@/components/shared/payment-badge"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

// Bookings store dates at UTC midnight, so format in UTC to avoid an off-by-one day.
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

function formatAmount(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return "Price on request"
  return currencyFormatter.format(amount)
}

function formatDate(value) {
  if (!value) return "Not specified"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : dateFormatter.format(date)
}

function ticketNumber(id) {
  return `FM-${String(id || "")
    .slice(-6)
    .toUpperCase()}`
}

function imageSource(booking) {
  const source =
    booking.image ||
    booking.imageUrl ||
    booking.serviceImage ||
    booking.service?.image ||
    null
  return typeof source === "string" && source.trim() ? source : null
}

export function BookingCard({ booking, busy = false, onCancel, onPay }) {
  const id = booking._id || booking.id
  const status = booking.status || "requested"
  const paymentStatus = booking.paymentStatus || "unpaid"
  const canCancel = Boolean(id) && status === "requested"
  const canPay = Boolean(id) && status === "completed" && paymentStatus === "unpaid"
  const title = booking.serviceTitle || booking.service?.title || "Repair request"
  const technicianName = booking.technicianName || booking.technician?.name || "Technician"
  const technicianEmail = booking.technicianEmail || booking.technician?.email || ""
  const image = imageSource(booking)
  const ticket = ticketNumber(id)

  return (
    <article className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-teal-50 ring-1 ring-teal-100 dark:bg-teal-950/40 dark:ring-teal-900/40">
            <ServiceImage
              src={image}
              alt={`${title} service`}
              width={96}
              height={80}
              sizes="96px"
              className="h-full w-full rounded-lg object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="break-words font-semibold leading-tight">{title}</h2>
            <p className="mt-1 break-words text-sm text-muted-foreground">
              {technicianName}
              {technicianEmail ? `, ${technicianEmail}` : ""}
            </p>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <p className="break-words">
                <span className="text-muted-foreground">Requested </span>
                <span className="font-semibold">{formatDate(booking.createdAt)}</span>
              </p>
              <p className="break-words">
                <span className="text-muted-foreground">Preferred </span>
                <span className="font-semibold">{formatDate(booking.preferredDate)}</span>
              </p>
            </div>

            {booking.problemDescription ? (
              <p className="mt-3 line-clamp-2 break-words text-sm text-muted-foreground">
                {booking.problemDescription}
              </p>
            ) : null}

            <p className="mt-2 break-words text-xs text-muted-foreground">
              Address: <span className="text-foreground/80">{booking.address || "Not specified"}</span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-border pt-4 sm:w-60 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          <p className="font-mono text-xs text-muted-foreground">Ticket #{ticket}</p>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status={status} withDot />
            <PaymentBadge status={paymentStatus} />
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Starting price</p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight">
              {formatAmount(booking.finalAmount ?? booking.basePrice ?? booking.price)}
            </p>
          </div>

          <div className="mt-auto pt-1">
            {canCancel ? (
              <Button
                variant="outline"
                className="w-full"
                aria-label={`Cancel request ${ticket}`}
                disabled={busy}
                onClick={onCancel}
              >
                {busy ? "Cancelling..." : "Cancel request"}
              </Button>
            ) : null}
            {canPay ? (
              <Button
                className="w-full"
                aria-label={`Pay now for ${ticket}`}
                disabled={busy}
                onClick={onPay}
              >
                {busy ? "Opening payment..." : "Pay Now"}
              </Button>
            ) : null}
            {!canCancel && !canPay ? (
              <p className="text-center text-xs text-muted-foreground">No actions available</p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}

export function BookingCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5" aria-hidden="true">
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="size-24 shrink-0 animate-pulse rounded-xl bg-muted/60" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted/60" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted/60" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted/60" />
            <div className="h-10 w-full animate-pulse rounded bg-muted/60" />
          </div>
        </div>
        <div className="space-y-3 border-t border-border pt-4 sm:w-60 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          <div className="h-3 w-24 animate-pulse rounded bg-muted/60" />
          <div className="h-5 w-32 animate-pulse rounded-full bg-muted/60" />
          <div className="h-7 w-20 animate-pulse rounded bg-muted/60" />
          <div className="h-8 w-full animate-pulse rounded bg-muted/60" />
        </div>
      </div>
    </div>
  )
}
