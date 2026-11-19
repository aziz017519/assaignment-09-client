import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Payment Cancelled</h1>
      <p className="mt-3 text-muted-foreground">Your payment was cancelled. No charges were made. You can try again from your bookings.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Button asChild><Link href="/dashboard/customer/bookings">Try Again (My Bookings)</Link></Button>
        <Button variant="outline" asChild><Link href="/">Back to Home</Link></Button>
      </div>
    </div>
  )
}
