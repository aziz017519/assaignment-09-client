import { EmptyState } from "@/components/shared/empty-state"

export default function AdminBookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground">Read-only view of all bookings with status filters.</p>
      </div>
      <EmptyState title="No bookings loaded" description="Connect to the admin bookings API to monitor all repair requests." />
    </div>
  )
}
