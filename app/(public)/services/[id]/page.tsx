import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Service } from "@/types"

async function getService(id: string): Promise<Service | null> {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")
  if (!base) return null
  try {
    const res = await fetch(`${base}/api/services/${id}`, { cache: "no-store" })
    if (!res.ok) return null
    const body = await res.json()
    return body?.service || body?.data || body || null
  } catch {
    return null
  }
}

export default async function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = await getService(id)
  if (!service || service.approvalStatus !== "approved") {
    notFound()
  }
  if ("available" in service && service.available === false) {
    notFound()
  }
  if ("isAvailable" in service && (service as any).isAvailable === false) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
          {service.image ? (
            <Image src={service.image} alt={service.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          ) : null}
        </div>
        <div>
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">{service.category}</span>
            <span className="rounded-full border px-2.5 py-1 capitalize">{service.serviceMode}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{service.title}</h1>
          <p className="mt-3 text-muted-foreground">{service.description}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border p-3"><p className="text-muted-foreground">Starting price</p><p className="font-semibold">${service.price}</p></div>
            <div className="rounded-lg border p-3"><p className="text-muted-foreground">Duration</p><p className="font-semibold">{service.duration || "N/A"}</p></div>
            <div className="rounded-lg border p-3"><p className="text-muted-foreground">Service area</p><p className="font-semibold">{service.area || "N/A"}</p></div>
            <div className="rounded-lg border p-3"><p className="text-muted-foreground">Availability</p><p className="font-semibold">{service.available === false ? "Unavailable" : "Available"}</p></div>
          </div>

          <div className="mt-6 rounded-xl border bg-card p-4">
            <h2 className="font-semibold">Technician</h2>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary font-semibold">
                {service.technician?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={service.technician.image} alt={service.technician.name} className="h-full w-full object-cover" />
                ) : (service.technician?.name || "T").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{service.technician?.name || "Technician"}</p>
                <p className="text-sm text-muted-foreground">{service.technician?.area || "Service area not specified"}</p>
              </div>
            </div>
            {service.technician?.bio ? <p className="mt-3 text-sm text-muted-foreground">{service.technician.bio}</p> : null}
          </div>

          <div className="mt-6 rounded-xl border border-dashed p-4">
            <h2 className="font-semibold">Request Repair</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in as a customer to send a repair request for this service.
            </p>
            <div className="mt-4 flex gap-2">
              <Button asChild>
                <Link href={`/sign-in?redirect=/services/${id}`}>Sign in to Request</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/services">Back to Services</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Note: Full role-aware request form, duplicate-check handling, and submission require client session state and server API integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
