import { cn } from "@/lib/utils"
import { PAYMENT_STATUS_META } from "@/lib/constants"

export function PaymentBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const meta =
    PAYMENT_STATUS_META[status] || {
      label: status,
      className: "bg-muted text-muted-foreground",
    }
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
