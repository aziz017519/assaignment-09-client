"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { LoaderCircle, Star, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ReviewBooking = {
  _id?: string
  id?: string
  serviceTitle?: string
  service?: { title?: string }
}

export function ReviewModal({
  open,
  booking,
  submitting,
  onSubmit,
  onClose,
}: {
  open: boolean
  booking: ReviewBooking | null
  submitting: boolean
  onSubmit: (value: { rating: number; review: string }) => void
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const baseId = useId()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [review, setReview] = useState("")

  const bookingId = booking?._id || booking?.id
  const title =
    booking?.serviceTitle || booking?.service?.title || "your repair service"

  useEffect(() => {
    if (!open) return
    void Promise.resolve().then(() => {
      setRating(0)
      setHovered(0)
      setReview("")
    })
  }, [open, bookingId])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // Focus the first rating control without trapping it on mount.
      window.requestAnimationFrame(() => {
        dialog.querySelector<HTMLElement>("[data-star='1']")?.focus()
      })
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  function handleStarKeyDown(event: KeyboardEvent<HTMLButtonElement>, value: number) {
    let next: number | null = null
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = Math.min(5, value + 1)
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = Math.max(1, value - 1)
    if (event.key === "Home") next = 1
    if (event.key === "End") next = 5
    if (next === null) return

    event.preventDefault()
    setRating(next)
    setHovered(next)
    dialogRef.current
      ?.querySelector<HTMLButtonElement>(`[data-star='${next}']`)
      ?.focus()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${baseId}-title`}
      aria-describedby={`${baseId}-description`}
      onCancel={(event) => {
        event.preventDefault()
        if (!submitting) onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !submitting) onClose()
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border bg-card p-0 text-card-foreground shadow-xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (rating > 0 && !submitting) onSubmit({ rating, review })
        }}
        className="p-5 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={`${baseId}-title`} className="text-lg font-semibold">
              Rate &amp; Review
            </h2>
            <p id={`${baseId}-description`} className="mt-1 text-sm text-muted-foreground">
              How was {title}? Your feedback helps other customers choose.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close review dialog"
            disabled={submitting}
            onClick={onClose}
          >
            <X />
          </Button>
        </div>

        <fieldset disabled={submitting} className="mt-6">
          <legend className="text-sm font-medium">
            Your rating <span className="text-destructive">*</span>
          </legend>
          <div
            role="radiogroup"
            aria-label="Rating from 1 to 5 stars"
            aria-describedby={`${baseId}-rating-status`}
            className="mt-2 flex items-center gap-1"
            onMouseLeave={() => setHovered(rating)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setHovered(rating)
              }
            }}
          >
            {[1, 2, 3, 4, 5].map((value) => {
              const active = (hovered || rating) >= value
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  data-star={value}
                  aria-checked={rating === value}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  tabIndex={rating ? (rating === value ? 0 : -1) : value === 1 ? 0 : -1}
                  className="rounded-md p-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none"
                  onClick={() => {
                    setRating(value)
                    setHovered(value)
                  }}
                  onFocus={() => setHovered(value)}
                  onKeyDown={(event) => handleStarKeyDown(event, value)}
                >
                  <Star
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className={cn(
                      "size-8 transition-colors",
                      active ? "fill-rating text-rating" : "text-muted-foreground/40"
                    )}
                  />
                </button>
              )
            })}
          </div>
          <p id={`${baseId}-rating-status`} aria-live="polite" className="sr-only">
            {rating > 0 ? `${rating} of 5 stars selected` : "No rating selected"}
          </p>
        </fieldset>

        <div className="mt-5">
          <label htmlFor={`${baseId}-review`} className="text-sm font-medium">
            Review <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id={`${baseId}-review`}
            value={review}
            maxLength={500}
            rows={4}
            disabled={submitting}
            onChange={(event) => setReview(event.target.value)}
            aria-describedby={`${baseId}-counter`}
            placeholder="Tell us what went well or what could be improved"
            className="mt-2 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-60"
          />
          <div className="mt-1 flex justify-end">
            <span
              id={`${baseId}-counter`}
              aria-live="polite"
              className={cn(
                "text-xs tabular-nums text-muted-foreground",
                review.length === 500 && "text-rating"
              )}
            >
              {review.length}/500
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={rating === 0 || submitting} className="min-w-32">
            {submitting ? (
              <>
                <LoaderCircle className="animate-spin" aria-hidden="true" />
                Submitting...
              </>
            ) : (
              "Submit review"
            )}
          </Button>
        </div>
      </form>
    </dialog>
  )
}
