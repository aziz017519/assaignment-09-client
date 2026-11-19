import { EmptyState } from "@/components/shared/empty-state"

export default function CustomerPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground">Your completed Stripe payments and transaction details.</p>
      </div>
      <EmptyState
        title="No payments yet"
        description="Completed payments will be listed here after successful checkout."
      />
    </div>
  )
}
