import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export function VerifiedProBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-teal-500/40 bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:border-teal-400/40 dark:bg-teal-400/10 dark:text-teal-300",
        className
      )}
    >
      <ShieldCheck className="size-3.5" aria-hidden="true" />
      Verified Pro
    </span>
  )
}
