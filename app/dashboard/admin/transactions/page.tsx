import { EmptyState } from "@/components/shared/empty-state"

export default function AdminTransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View all payments and total revenue.</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-2">
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="text-lg font-semibold">—</p>
        </div>
      </div>
      <EmptyState title="No transactions loaded" description="Connect to the payments API to display transaction history and revenue totals." />
    </div>
  )
}
