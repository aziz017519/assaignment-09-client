import { EmptyState } from "@/components/shared/empty-state"

export default function TechnicianRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Repair Requests</h1>
        <p className="text-muted-foreground">Review incoming requests and update status: Requested (Accept/Reject), Accepted (Start Work), In Progress (Mark Completed with final amount).</p>
      </div>
      <EmptyState title="No requests yet" description="Customer repair requests for your services will appear here." />
    </div>
  )
}
