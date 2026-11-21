"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/shared/confirm-modal"
import {
  AdminDateRange,
  AdminErrorBanner,
  AdminPagination,
  AdminSelect,
  AdminStatusBadge,
  AdminToolbar,
  adminFieldClass,
} from "@/components/admin/admin-filters"
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table"
import { useAdminBookings } from "@/hooks/use-admin-bookings"
import { formatDate, formatMoney } from "@/lib/admin-format"
import { ADMIN_BOOKING_STATUSES, type AdminBooking } from "@/types/admin"
import type { BookingStatus } from "@/types"

type Action = { booking: AdminBooking; status: BookingStatus } | null

const NEXT_STATUSES: Record<BookingStatus, BookingStatus[]> = {
  requested: ["accepted", "rejected", "cancelled"],
  accepted: ["in-progress"],
  "in-progress": ["completed"],
  completed: [],
  rejected: [],
  cancelled: [],
}

const statusLabel: Record<BookingStatus, string> = {
  requested: "Requested",
  accepted: "Accepted",
  "in-progress": "In progress",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
}

const statusTone: Record<BookingStatus, "amber" | "blue" | "green" | "red" | "gray"> = {
  requested: "amber",
  accepted: "blue",
  "in-progress": "amber",
  completed: "green",
  rejected: "red",
  cancelled: "gray",
}

function paymentTone(status?: string | null): "green" | "amber" | "red" | "blue" | "gray" {
  if (status === "paid") return "green"
  if (status === "unpaid" || status === "pending") return "amber"
  if (status === "failed") return "red"
  if (status === "refunded") return "blue"
  return "gray"
}

export default function AdminBookingsPage() {
  const {
    rows,
    meta,
    loading,
    error,
    filters,
    searchInput,
    setSearchInput,
    setFilter,
    retry,
    updateStatus,
  } = useAdminBookings()
  const [action, setAction] = useState<Action>(null)
  const [finalAmount, setFinalAmount] = useState("")
  const [saving, setSaving] = useState(false)

  const openAction = useCallback((next: Action) => {
    setFinalAmount(next?.status === "completed" ? String(next.booking.price ?? "") : "")
    setAction(next)
  }, [])

  const confirmAction = useCallback(async () => {
    if (!action || saving) return
    let amount: number | undefined
    if (action.status === "completed") {
      amount = Number(finalAmount)
      if (!Number.isFinite(amount) || amount <= 0) {
        toast.error("Enter a final amount greater than 0")
        return
      }
    }
    setSaving(true)
    try {
      await updateStatus(action.booking.id, action.status, amount)
      toast.success(`${action.booking.serviceTitle} marked as ${statusLabel[action.status].toLowerCase()}`)
      openAction(null)
      retry()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update booking")
    } finally {
      setSaving(false)
    }
  }, [action, finalAmount, openAction, retry, saving, updateStatus])

  const columns: AdminColumn<AdminBooking>[] = [
    {
      key: "booking",
      header: "Booking",
      render: (booking) => (
        <div>
          <div className="font-medium">{booking.serviceTitle || "Service request"}</div>
          <div className="text-xs text-muted-foreground">
            #{String(booking.ticketId ?? booking.id).slice(-8)}
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (booking) => (
        <div>
          <div>{booking.customerName || "—"}</div>
          {booking.customerEmail ? (
            <div className="text-xs text-muted-foreground">{booking.customerEmail}</div>
          ) : null}
        </div>
      ),
    },
    {
      key: "technician",
      header: "Technician",
      render: (booking) => booking.technicianName || "—",
    },
    {
      key: "preferredDate",
      header: "Preferred date",
      render: (booking) => formatDate(booking.preferredDate),
    },
    {
      key: "amount",
      header: "Amount",
      render: (booking) => (
        <div>
          <div className="font-medium">{formatMoney(booking.price)}</div>
          {booking.basePrice && booking.basePrice !== booking.price ? (
            <div className="text-xs text-muted-foreground">Base {formatMoney(booking.basePrice)}</div>
          ) : null}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (booking) => (
        <AdminStatusBadge
          label={statusLabel[booking.status] ?? booking.status}
          tone={statusTone[booking.status] ?? "gray"}
        />
      ),
    },
    {
      key: "payment",
      header: "Payment",
      render: (booking) => (
        <AdminStatusBadge
          label={booking.paymentStatus ? booking.paymentStatus[0].toUpperCase() + booking.paymentStatus.slice(1) : "—"}
          tone={paymentTone(booking.paymentStatus)}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (booking) => {
        const next = NEXT_STATUSES[booking.status] ?? []
        if (next.length === 0) return <span className="text-muted-foreground">—</span>
        return (
          <div className="flex flex-wrap gap-1.5">
            {next.map((status) => (
              <Button
                key={status}
                size="xs"
                variant={status === "completed" ? "secondary" : "outline"}
                disabled={saving}
                aria-label={`${statusLabel[status]} ${booking.customerName}`}
                onClick={() => openAction({ booking, status })}
              >
                {statusLabel[status]}
              </Button>
            ))}
          </div>
        )
      },
    },
  ]

  const destructive = action?.status === "rejected" || action?.status === "cancelled"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground">
          Monitor all repair requests, filter by status or date, and move bookings through their workflow.
        </p>
      </div>

      <AdminErrorBanner error={error} onRetry={retry} loading={loading} />

      <AdminToolbar
        search={searchInput}
        onSearch={setSearchInput}
        placeholder="Search customer, technician or service"
        sort={filters.sort ?? "newest"}
        onSort={(value) => setFilter("sort", value)}
        sortOptions={[
          { label: "Newest", value: "newest" },
          { label: "Oldest", value: "oldest" },
          { label: "Preferred date ↑", value: "date_asc" },
          { label: "Preferred date ↓", value: "date_desc" },
          { label: "Amount low to high", value: "price_asc" },
          { label: "Amount high to low", value: "price_desc" },
        ]}
      >
        <AdminSelect
          label="Status"
          value={filters.status}
          options={ADMIN_BOOKING_STATUSES}
          onChange={(value) => setFilter("status", value)}
        />
        <AdminDateRange
          from={filters.from}
          to={filters.to}
          onFromChange={(value) => setFilter("from", value)}
          onToChange={(value) => setFilter("to", value)}
        />
      </AdminToolbar>

      <AdminTable
        columns={columns}
        rows={rows}
        rowKey={(booking) => booking.id}
        loading={loading}
        emptyTitle="No bookings found"
        emptyDescription="Try a different search, status or date range."
      />

      <AdminPagination meta={meta} onPage={(page) => setFilter("page", String(page))} />

      <ConfirmModal
        open={!!action}
        title={`${action ? statusLabel[action.status] : ""} booking`}
        description={
          action
            ? `Mark ${action.booking.serviceTitle} for ${action.booking.customerName} as ${statusLabel[action.status].toLowerCase()}?`
            : undefined
        }
        confirmLabel={action?.status === "completed" ? "Complete booking" : "Change status"}
        destructive={destructive}
        loading={saving}
        onConfirm={() => void confirmAction()}
        onCancel={() => openAction(null)}
      >
        {action?.status === "completed" ? (
          <label className="mt-4 block text-sm">
            <span className="text-muted-foreground">Final amount</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={finalAmount}
              onChange={(event) => setFinalAmount(event.target.value)}
              className={`${adminFieldClass} mt-1 w-full`}
              aria-label="Final amount"
            />
          </label>
        ) : null}
      </ConfirmModal>
    </div>
  )
}
