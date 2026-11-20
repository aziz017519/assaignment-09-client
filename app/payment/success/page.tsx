import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type Verification = {
  amount?: number | string
  transactionId?: string
  paymentIntentId?: string
}

async function SuccessContent({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const sessionId = typeof params.session_id === "string" ? params.session_id : null
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")
  let verification: Verification | null = null
  if (sessionId && base) {
    try {
      const res = await fetch(`${base}/api/payments/verify?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" })
      if (res.ok) verification = (await res.json()) as Verification
    } catch {
      // handle gracefully
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-green-600">Payment Successful</h1>
      <p className="mt-3 text-muted-foreground">Your payment has been processed. Thank you for using FixMate.</p>
      <div className="mt-6 rounded-xl border bg-card p-5 text-left text-sm">
        <p><span className="font-medium">Session ID:</span> {sessionId || "N/A"}</p>
        <p className="mt-2"><span className="font-medium">Amount:</span> {verification?.amount ?? "—"}</p>
        <p className="mt-2"><span className="font-medium">Transaction ID:</span> {verification?.transactionId ?? verification?.paymentIntentId ?? "—"}</p>
        {!verification ? <p className="mt-3 text-xs text-muted-foreground">Verification details will appear when the server API is reachable and the session is valid.</p> : null}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <Button asChild><Link href="/dashboard/customer/bookings">Back to My Bookings</Link></Button>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <Suspense fallback={<div className="p-10 text-center">Verifying payment...</div>}>
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  )
}
