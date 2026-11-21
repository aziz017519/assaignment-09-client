"use client"

import { CheckCircle2, Clock3, DollarSign, XCircle } from "lucide-react"
import {
  AdminDateRange,
  AdminErrorBanner,
  AdminPagination,
  AdminSelect,
  AdminStatusBadge,
  AdminToolbar,
} from "@/components/admin/admin-filters"
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table"
import { StatsCard } from "@/components/shared/stats-card"
import { useAdminTransactions } from "@/hooks/use-admin-transactions"
import { formatDate, formatMoney, formatNumber } from "@/lib/admin-format"
import {
  ADMIN_TRANSACTION_TYPES,
  type AdminTransaction,
} from "@/types/admin"

const TRANSACTION_STATUSES = ["paid", "unpaid", "pending", "failed", "refunded"] as const

function label(value: string) {
  return value ? value[0].toUpperCase() + value.slice(1) : "—"
}

function statusTone(status: string): "green" | "amber" | "red" | "blue" | "gray" {
  if (status === "paid") return "green"
  if (status === "unpaid" || status === "pending") return "amber"
  if (status === "failed" || status === "refunded") return "red"
  return "gray"
}

export default function AdminTransactionsPage() {
  const {
    rows,
    meta,
    summary,
    loading,
    error,
    filters,
    searchInput,
    setSearchInput,
    setFilter,
    retry,
  } = useAdminTransactions()

  const columns: AdminColumn<AdminTransaction>[] = [
    {
      key: "transaction",
      header: "Transaction",
      render: (row) => (
        <div>
          <div className="font-medium">{row.transactionId || String(row.id).slice(-8)}</div>
          <div className="text-xs text-muted-foreground">ID {String(row.id).slice(-8)}</div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row) => (
        <div>
          <div>{row.customerName || "—"}</div>
          {row.customerEmail ? (
            <div className="text-xs text-muted-foreground">{row.customerEmail}</div>
          ) : null}
        </div>
      ),
    },
    {
      key: "service",
      header: "Service",
      render: (row) => row.serviceTitle || (row.type === "subscription" ? "Subscription plan" : "—"),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <AdminStatusBadge label={label(row.type)} tone={row.type === "subscription" ? "blue" : "gray"} />
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => formatMoney(row.amount, row.currency),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <AdminStatusBadge label={label(row.status)} tone={statusTone(row.status)} />,
    },
    {
      key: "date",
      header: "Date",
      render: (row) => formatDate(row.date ?? row.createdAt),
    },
    {
      key: "receipt",
      header: "Receipt",
      render: (row) =>
        row.receiptUrl ? (
          <a
            href={row.receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4"
          >
            View
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">
          Real payment records from bookings and subscriptions. No fabricated payment methods.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading && !summary ? (
          <>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border bg-card p-5 shadow-sm">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="mt-3 h-8 w-16 rounded bg-muted" />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatsCard
              title="Total Revenue"
              value={formatMoney(summary?.totalRevenue ?? 0)}
              icon={DollarSign}
            />
            <StatsCard
              title="Successful"
              value={formatNumber(summary?.successful ?? 0)}
              icon={CheckCircle2}
            />
            <StatsCard
              title="Pending"
              value={formatNumber(summary?.pending ?? 0)}
              icon={Clock3}
            />
            <StatsCard
              title="Failed"
              value={formatNumber(summary?.failed ?? 0)}
              icon={XCircle}
            />
          </>
        )}
      </div>

      <AdminErrorBanner error={error} onRetry={retry} loading={loading} />

      <AdminToolbar
        search={searchInput}
        onSearch={setSearchInput}
        placeholder="Search customer, transaction ID or service"
        sort={filters.sort ?? "newest"}
        onSort={(value) => setFilter("sort", value)}
        sortOptions={[
          { label: "Newest", value: "newest" },
          { label: "Oldest", value: "oldest" },
          { label: "Amount low to high", value: "amount_asc" },
          { label: "Amount high to low", value: "amount_desc" },
        ]}
      >
        <AdminSelect
          label="Status"
          value={filters.status}
          options={TRANSACTION_STATUSES}
          onChange={(value) => setFilter("status", value)}
        />
        <AdminSelect
          label="Type"
          value={filters.method}
          options={ADMIN_TRANSACTION_TYPES}
          onChange={(value) => setFilter("method", value)}
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
        rowKey={(row) => row.id}
        loading={loading}
        emptyTitle="No transactions found"
        emptyDescription="Try a different search, status, type or date range."
      />

      <AdminPagination meta={meta} onPage={(page) => setFilter("page", String(page))} />
    </div>
  )
}
