import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatsCard({
  title,
  value,
  icon: Icon,
  className,
  footer,
}: {
  title: string
  value: string | number
  icon?: LucideIcon
  className?: string
  footer?: ReactNode
}) {
  return (
    <div className={cn("rounded-xl border bg-card p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        {Icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  )
}
