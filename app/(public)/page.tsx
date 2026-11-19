import Link from "next/link"
import { Search, Wrench, ClipboardList, BadgeDollarSign, CheckCircle2, Shield, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServiceCard } from "@/components/services/service-card"
import { CATEGORIES } from "@/lib/constants"
import type { Service } from "@/types"

async function getFeaturedServices(): Promise<Service[]> {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")
  if (!base) return []
  try {
    const res = await fetch(`${base}/api/services?approved=true&available=true&limit=6&sort=newest`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : data?.services || data?.data || []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const featured = await getFeaturedServices()

  return (
    <div>
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Trusted repairs, on your schedule
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Smart device & home appliance repair, made simple
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Find verified technicians, send a repair request in minutes, track the job, and pay securely after the work is completed.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/services"><Search className="mr-2 h-4 w-4" /> Find a Service</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">How It Works</Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
            <div className="relative flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow">
                <Wrench className="h-8 w-8" />
              </div>
              <p className="text-lg font-semibold">Expert technicians for every fix</p>
              <p className="max-w-sm text-sm text-muted-foreground">AC, fridge, washing machine, TV, mobile, laptop and more—book the right help fast.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Featured Services</h2>
            <p className="mt-2 text-muted-foreground">Latest approved and available services from our technicians.</p>
          </div>
          <Button variant="outline" asChild className="hidden sm:inline-flex">
            <Link href="/services">View all</Link>
          </Button>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.slice(0, 6).map((service) => (
              <ServiceCard key={service._id || service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            <p className="font-medium text-foreground">No featured services available yet.</p>
            <p className="mt-1 text-sm">Browse all services or check back soon as technicians add new offers.</p>
            <Button asChild className="mt-4"><Link href="/services">Browse Services</Link></Button>
          </div>
        )}
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">How It Works</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">Four simple steps from problem to fixed.</p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Search, title: "Find a Service", desc: "Browse categories and pick the right repair service for your device." },
              { icon: ClipboardList, title: "Send a Request", desc: "Share your issue, address, and preferred date with the technician." },
              { icon: Wrench, title: "Technician Fixes It", desc: "Track status updates as your technician accepts and completes the job." },
              { icon: BadgeDollarSign, title: "Pay After Completion", desc: "Pay securely via Stripe once the repair is completed." },
            ].map((step, i) => (
              <div key={step.title} className="rounded-xl border bg-card p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-primary">Step {i + 1}</p>
                <h3 className="mt-1 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Popular Categories</h2>
        <p className="mt-2 text-muted-foreground">Quickly find services by category.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/services?category=${encodeURIComponent(cat)}`}
              className="rounded-full border bg-card px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 md:py-20">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Why Choose FixMate</h2>
              <ul className="mt-6 space-y-4">
                {[
                  { icon: Shield, title: "Verified technicians", desc: "Services are reviewed and approved by admins." },
                  { icon: Clock, title: "Fast & convenient", desc: "Request repairs and track progress from your dashboard." },
                  { icon: CheckCircle2, title: "Pay after completion", desc: "Transparent pricing and secure Stripe checkout." },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "500+", label: "Repairs completed" },
                { value: "100+", label: "Verified technicians" },
                { value: "4.9/5", label: "Average rating" },
                { value: "24/7", label: "Support availability" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border bg-card p-5">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
              <div className="col-span-2 rounded-xl border bg-card p-5">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">“FixMate made it easy to find a reliable technician for my AC. Clear updates and smooth payment.”</p>
                <p className="mt-2 text-sm font-medium">— Happy Customer</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
