import { PaymentSuccessCard } from "@/components/shared/payment-success-card"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function TechnicianSubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const sessionId = typeof params.session_id === "string" ? params.session_id : null

  return (
    <PaymentSuccessCard
      sessionId={sessionId}
      backHref="/dashboard/technician/subscription"
      backLabel="Manage subscription"
    />
  )
}
