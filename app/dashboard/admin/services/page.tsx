import { EmptyState } from "@/components/shared/empty-state"

export default function AdminServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground">Review all services, filter by approval status (pending first), and approve or reject submissions.</p>
      </div>
      <EmptyState title="No services loaded" description="Connect to the admin services API to review and moderate service listings." />
    </div>
  )
}
