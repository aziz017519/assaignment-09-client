import Link from "next/link"
import { Search, ClipboardList, Wrench, BadgeDollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

const steps = [
  { icon: Search, title: "Find a Service", desc: "Browse approved services by category, mode, and price to find the right technician for your device." },
  { icon: ClipboardList, title: "Send a Request", desc: "Submit your repair details, preferred date, and contact information in a quick request form." },
  { icon: Wrench, title: "Technician Fixes It", desc: "Your technician accepts the request, starts work, and keeps you updated through each status." },
  { icon: BadgeDollarSign, title: "Pay After Completion", desc: "Once the job is done, review the final amount and pay securely through Stripe Checkout." },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">How FixMate Works</h1>
        <p className="mt-4 text-muted-foreground">
          FixMate makes it easy to book trusted technicians for smart device and home appliance repairs. From request to payment, everything happens in one place.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <div key={step.title} className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <step.icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium text-primary">Step {i + 1}</p>
            <h2 className="mt-1 text-lg font-semibold">{step.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 rounded-2xl border bg-muted/30 p-8 text-center">
        <h2 className="text-2xl font-semibold">Ready to get started?</h2>
        <p className="mt-2 text-muted-foreground">Browse services and book a repair in minutes.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild><Link href="/services">Browse Services</Link></Button>
          <Button variant="outline" asChild><Link href="/sign-up">Create Account</Link></Button>
        </div>
      </div>
    </div>
  )
}
