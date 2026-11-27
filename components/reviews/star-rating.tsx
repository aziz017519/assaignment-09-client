import { Star } from "lucide-react"

import { formatRating, toCountNumber, toRatingNumber } from "@/lib/service-display"
import { cn } from "@/lib/utils"

const starSizes = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
} as const

export function StarRating({
  rating,
  count,
  size = "md",
  showCount = true,
  className,
}: {
  rating?: number | string | null
  count?: number | string | null
  size?: keyof typeof starSizes
  showCount?: boolean
  className?: string
}) {
  const value = toRatingNumber(rating)
  const reviewCount = toCountNumber(count)
  const hasRating = value > 0
  // Snap only the visual fill to half stars; the label keeps the exact average.
  const fillPercent = Math.round(value * 2) * 10
  const label = hasRating
    ? `${formatRating(value)} out of 5 stars${reviewCount > 0 ? ` from ${reviewCount} reviews` : ""}`
    : "No reviews yet"

  return (
    <div
      className={cn(
        "inline-flex min-h-5 items-center gap-1.5 whitespace-nowrap",
        className
      )}
    >
      <span className="relative inline-flex" role="img" aria-label={label}>
        <span className="flex w-max gap-0.5 text-muted-foreground/40" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <Star key={`empty-${index}`} className={starSizes[size]} strokeWidth={1.5} />
          ))}
        </span>
        {hasRating ? (
          <span
            className="absolute inset-y-0 left-0 overflow-hidden text-rating"
            style={{ width: `${fillPercent}%` }}
            aria-hidden="true"
          >
            <span className="flex w-max gap-0.5">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={`filled-${index}`}
                  className={cn(starSizes[size], "fill-current")}
                  strokeWidth={1.5}
                />
              ))}
            </span>
          </span>
        ) : null}
      </span>
      {showCount ? (
        <span
          className={cn(
            "text-xs tabular-nums",
            hasRating ? "font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          {hasRating
            ? `${formatRating(value)}${reviewCount > 0 ? ` (${reviewCount})` : ""}`
            : "No reviews yet"}
        </span>
      ) : null}
    </div>
  )
}
