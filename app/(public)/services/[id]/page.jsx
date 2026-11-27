import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/reviews/star-rating"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import { ServiceImage } from "@/components/shared/service-image"
import {
  formatServicePrice,
  getServiceArea,
  getServiceDuration,
  getTechnician,
} from "@/lib/service-display"
import { RequestRepairForm } from "@/components/services/request-repair-form"
import { getApiBaseUrl } from "@/lib/api"

async function getService(id) {
  const base = getApiBaseUrl()
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

export default async function ServiceDetailsPage({ params }) {
  const { id } = await params
  const service = await getService(id)
  if (!service || service.approvalStatus !== "approved") {
    notFound()
  }
  if ("available" in service && service.available === false) {
    notFound()
  }
  if ("isAvailable" in service && service.isAvailable === false) {
    notFound()
  }

  const priceLabel = formatServicePrice(service)
  const duration = getServiceDuration(service) ?? "Varies"
  const serviceArea = getServiceArea(service) ?? "Not specified"
  const technician = getTechnician(service)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
          <ServiceImage
            src={service.image}
            alt={service.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div>
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">{service.category}</span>
            <span className="rounded-full border px-2.5 py-1 capitalize">{service.serviceMode}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{service.title}</h1>
          <StarRating
            rating={service.averageRating}
            count={service.ratingCount}
            className="mt-2"
          />
          <p className="mt-3 text-muted-foreground">{service.description}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border p-3"><p className="text-muted-foreground">Starting price</p><p className="font-semibold">{priceLabel}</p></div>
            <div className="rounded-lg border p-3"><p className="text-muted-foreground">Duration</p><p className="font-semibold">{duration}</p></div>
            <div className="rounded-lg border p-3"><p className="text-muted-foreground">Service area</p><p className="font-semibold">{serviceArea}</p></div>
            <div className="rounded-lg border p-3"><p className="text-muted-foreground">Availability</p><p className="font-semibold">{service.available === false ? "Unavailable" : "Available"}</p></div>
          </div>

          <div className="mt-6 rounded-xl border bg-card p-4">
            <h2 className="font-semibold">Technician</h2>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary font-semibold">
                {technician?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={technician.image} alt={technician.name ?? "Technician"} className="h-full w-full object-cover" />
                ) : (technician?.name || "T").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{technician?.name ?? "Technician"}</p>
                <p className="text-sm text-muted-foreground">{technician?.area || "Not specified"}</p>
              </div>
            </div>
            {technician?.bio ? <p className="mt-3 text-sm text-muted-foreground">{technician.bio}</p> : null}
          </div>

          <RequestRepairForm serviceId={service._id || service.id || id} />
          <div className="mt-4 flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/services">Back to Services</Link>
            </Button>
          </div>
        </div>
      </div>

      <ReviewsSection
        serviceId={String(service._id || service.id || id)}
        ratingCount={service.ratingCount}
      />
    </div>
  )
}
