"use client"

import type { ReactNode } from "react"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const fieldClass =
  "h-8 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"

export function AdminToolbar({
  search,
  onSearch,
  placeholder,
  sort,
  sortOptions,
  onSort,
  children,
}: {
  search: string
  onSearch: (value: string) => void
  placeholder: string
  sort: string
  sortOptions: { label: string; value: string }[]
  onSort: (value: string) => void
  children?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
      <label className="relative min-w-[200px] flex-1">
        <span className="sr-only">{placeholder}</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={placeholder}
          className={cn(fieldClass, "w-full")}
        />
      </label>
      {children}
      <label>
        <span className="sr-only">Sort</span>
        <select
          value={sort}
          onChange={(event) => onSort(event.target.value)}
          className={fieldClass}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export function AdminSelect({
  label,
  value,
  options,
  onChange,
  allLabel = "All",
}: {
  label: string
  value?: string
  options: readonly string[]
  onChange: (value: string) => void
  allLabel?: string
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClass}
        aria-label={label}
      >
        <option value="">{allLabel} {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export function AdminDateRange({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from?: string
  to?: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <label>
        <span className="sr-only">From date</span>
        <input
          type="date"
          value={from ?? ""}
          onChange={(event) => onFromChange(event.target.value)}
          className={fieldClass}
          aria-label="From date"
        />
      </label>
      <span className="text-xs text-muted-foreground">to</span>
      <label>
        <span className="sr-only">To date</span>
        <input
          type="date"
          value={to ?? ""}
          onChange={(event) => onToChange(event.target.value)}
          className={fieldClass}
          aria-label="To date"
        />
      </label>
    </div>
  )
}

export function AdminPagination({
  meta,
  onPage,
}: {
  meta: { page: number; totalPages: number; total: number } | null
  onPage: (page: number) => void
}) {
  if (!meta) return null
  const page = Math.max(1, meta.page)
  const totalPages = Math.max(1, meta.totalPages)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>
        {meta.total.toLocaleString("en-US")} result{meta.total === 1 ? "" : "s"} · page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

type Tone = "green" | "amber" | "red" | "blue" | "gray"

const toneClasses: Record<Tone, string> = {
  green: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  gray: "bg-muted text-muted-foreground",
}

export function AdminStatusBadge({
  label,
  tone = "gray",
  className,
}: {
  label: string
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {label}
    </span>
  )
}

export function AdminErrorBanner({
  error,
  onRetry,
  loading,
}: {
  error: string | null
  onRetry: () => void
  loading: boolean
}) {
  if (!error) return null
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <span>{error}</span>
      <Button variant="outline" size="sm" onClick={onRetry} disabled={loading}>
        <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
        Retry
      </Button>
    </div>
  )
}

export { fieldClass as adminFieldClass }
