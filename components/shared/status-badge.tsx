import { cn } from "@/lib/utils"
import { APPROVAL_STATUS_META, BOOKING_STATUS_META } from "@/lib/constants"

export function StatusBadge({
  status,
  kind = "booking",
  className,
  withDot = false,
}: {
  status: string
  kind?: "booking" | "approval"
  className?: string
  withDot?: boolean
}) {
  const meta =
    kind === "approval"
      ? APPROVAL_STATUS_META[status] || { label: status, className: "bg-muted text-muted-foreground" }
      : BOOKING_STATUS_META[status] || { label: status, className: "bg-muted text-muted-foreground" }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        withDot ? "gap-1.5" : null,
        meta.className,
        className
      )}
    >
      {withDot ? <span className="size-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {meta.label}
    </span>
  )
}
