import { EmptyState } from "@/components/shared/empty-state"

export default function CustomerBookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your repair requests. Cancel is available only when status is requested. Pay Now appears only when completed and unpaid.</p>
      </div>
      <EmptyState
        title="No bookings yet"
        description="When you request a repair, your bookings will appear here with status and payment actions."
      />
    </div>
  )
}
