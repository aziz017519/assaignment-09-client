import { cn } from "@/lib/utils"
import { APPROVAL_STATUS_META, BOOKING_STATUS_META } from "@/lib/constants"

export function StatusBadge({
  status,
  kind = "booking",
  className,
}: {
  status: string
  kind?: "booking" | "approval"
  className?: string
}) {
  const meta =
    kind === "approval"
      ? APPROVAL_STATUS_META[status] || { label: status, className: "bg-muted text-muted-foreground" }
      : BOOKING_STATUS_META[status] || { label: status, className: "bg-muted text-muted-foreground" }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        meta.className,
        className
      )}
    >
      {meta.label}
    </span>
  )
}
