import { PaymentSuccessCard } from "@/components/shared/payment-success-card"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function CustomerPaymentSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const sessionId = typeof params.session_id === "string" ? params.session_id : null

  return (
    <PaymentSuccessCard
      sessionId={sessionId}
      backHref="/dashboard/customer"
      backLabel="Back to dashboard"
    />
  )
}
