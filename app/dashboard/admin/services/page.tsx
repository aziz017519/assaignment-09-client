"use client"

import { useCallback, useState } from "react"
import { Check, Eye, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/shared/confirm-modal"
import {
  AdminErrorBanner,
  AdminPagination,
  AdminSelect,
  AdminStatusBadge,
  AdminToolbar,
} from "@/components/admin/admin-filters"
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table"
import { useAdminServices } from "@/hooks/use-admin-services"
import { formatDate, formatMoney } from "@/lib/admin-format"
import {
  ADMIN_APPROVAL_STATUSES,
  ADMIN_SERVICE_CATEGORIES,
  type AdminService,
} from "@/types/admin"
import type { ApprovalStatus } from "@/types"

type Action =
  | { type: "status"; service: AdminService; status: ApprovalStatus }
  | { type: "delete"; service: AdminService }
  | null

const statusTone: Record<ApprovalStatus, "amber" | "green" | "red"> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
}

const statusLabel: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
}

function ServiceDetails({ service, onClose }: { service: AdminService; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Service details: ${service.title}`}
        className="relative z-10 w-full max-w-lg rounded-xl border bg-background p-6 shadow-lg"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{service.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Service details</p>
          </div>
          <AdminStatusBadge
            label={statusLabel[service.status] ?? service.status}
            tone={statusTone[service.status] ?? "gray"}
          />
        </div>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Category</dt>
            <dd className="mt-1 font-medium">{service.category || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Price</dt>
            <dd className="mt-1 font-medium">{formatMoney(service.price)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Technician</dt>
            <dd className="mt-1 font-medium">{service.technicianName || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Technician email</dt>
            <dd className="mt-1 break-all font-medium">{service.technicianEmail || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Created</dt>
            <dd className="mt-1 font-medium">{formatDate(service.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Availability</dt>
            <dd className="mt-1 font-medium">{service.isAvailable ? "Available" : "Unavailable"}</dd>
          </div>
        </dl>
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}

export default function AdminServicesPage() {
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
    deleteService,
  } = useAdminServices()
  const [action, setAction] = useState<Action>(null)
  const [viewing, setViewing] = useState<AdminService | null>(null)
  const [saving, setSaving] = useState(false)

  const confirmAction = useCallback(async () => {
    if (!action || saving) return
    setSaving(true)
    try {
      if (action.type === "status") {
        await updateStatus(action.service.id, action.status)
        toast.success(`${action.service.title} is now ${action.status}`)
      } else {
        await deleteService(action.service.id)
        toast.success(`${action.service.title} deleted`)
      }
      setAction(null)
      retry()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update service")
    } finally {
      setSaving(false)
    }
  }, [action, deleteService, retry, saving, updateStatus])

  const columns: AdminColumn<AdminService>[] = [
    {
      key: "title",
      header: "Service",
      render: (service) => (
        <div className="flex items-center gap-3">
          {service.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={service.image} alt="" className="size-9 rounded-lg object-cover" />
          ) : null}
          <span className="font-medium">{service.title}</span>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (service) => service.category || "—" },
    {
      key: "technician",
      header: "Technician",
      render: (service) => (
        <div>
          <div>{service.technicianName || "—"}</div>
          {service.technicianEmail ? (
            <div className="text-xs text-muted-foreground">{service.technicianEmail}</div>
          ) : null}
        </div>
      ),
    },
    { key: "price", header: "Price", render: (service) => formatMoney(service.price) },
    {
      key: "status",
      header: "Status",
      render: (service) => (
        <AdminStatusBadge
          label={statusLabel[service.status] ?? service.status}
          tone={statusTone[service.status] ?? "gray"}
        />
      ),
    },
    { key: "created", header: "Created", render: (service) => formatDate(service.createdAt) },
    {
      key: "actions",
      header: "Actions",
      render: (service) => (
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="xs"
            variant="outline"
            aria-label={`View ${service.title}`}
            onClick={() => setViewing(service)}
          >
            <Eye /> View
          </Button>
          <Button
            size="xs"
            variant="secondary"
            disabled={service.status === "approved" || saving}
            aria-label={`Approve ${service.title}`}
            onClick={() => setAction({ type: "status", service, status: "approved" })}
          >
            <Check /> Approve
          </Button>
          <Button
            size="xs"
            variant="destructive"
            disabled={service.status === "rejected" || saving}
            aria-label={`Reject ${service.title}`}
            onClick={() => setAction({ type: "status", service, status: "rejected" })}
          >
            <X /> Reject
          </Button>
          <Button
            size="xs"
            variant="destructive"
            aria-label={`Delete ${service.title}`}
            onClick={() => setAction({ type: "delete", service })}
          >
            <Trash2 /> Delete
          </Button>
        </div>
      ),
    },
  ]

  const confirmTitle =
    action?.type === "delete" ? "Delete service" : action ? `${statusLabel[action.status]} service` : ""
  const confirmDescription =
    action?.type === "delete"
      ? `Permanently delete "${action.service.title}"? This cannot be undone.`
      : action
        ? `Change "${action.service.title}" from ${statusLabel[action.service.status]} to ${statusLabel[action.status]}?`
        : undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground">Review all services, filter by approval status, and approve or reject submissions.</p>
      </div>

      <AdminErrorBanner error={error} onRetry={retry} loading={loading} />

      <AdminToolbar
        search={searchInput}
        onSearch={setSearchInput}
        placeholder="Search title, technician or category"
        sort={filters.sort ?? "newest"}
        onSort={(value) => setFilter("sort", value)}
        sortOptions={[
          { label: "Newest", value: "newest" },
          { label: "Oldest", value: "oldest" },
          { label: "Price low to high", value: "price_asc" },
          { label: "Price high to low", value: "price_desc" },
          { label: "Title A-Z", value: "title_asc" },
        ]}
      >
        <AdminSelect
          label="Status"
          value={filters.status}
          options={ADMIN_APPROVAL_STATUSES}
          onChange={(value) => setFilter("status", value)}
        />
        <AdminSelect
          label="Category"
          value={filters.category}
          options={ADMIN_SERVICE_CATEGORIES}
          onChange={(value) => setFilter("category", value)}
        />
      </AdminToolbar>

      <AdminTable
        columns={columns}
        rows={rows}
        rowKey={(service) => service.id}
        loading={loading}
        emptyTitle="No services found"
        emptyDescription="Try a different search or filter."
      />

      <AdminPagination meta={meta} onPage={(page) => setFilter("page", String(page))} />

      <ConfirmModal
        open={!!action}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={action?.type === "delete" ? "Delete" : "Change status"}
        destructive={action?.type === "delete" || action?.type === "status"}
        loading={saving}
        onConfirm={() => void confirmAction()}
        onCancel={() => setAction(null)}
      />

      {viewing ? <ServiceDetails service={viewing} onClose={() => setViewing(null)} /> : null}
    </div>
  )
}
