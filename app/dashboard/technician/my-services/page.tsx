import { EmptyState } from "@/components/shared/empty-state"

export default function MyServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Services</h1>
        <p className="text-muted-foreground">Manage your services: edit (returns to pending), delete with confirmation, and toggle availability.</p>
      </div>
      <EmptyState title="No services yet" description="Add your first service to start receiving repair requests." />
    </div>
  )
}
