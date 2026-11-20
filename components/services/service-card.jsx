import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ServiceImage } from "@/components/shared/service-image"
import { formatServicePrice, getTechnician } from "@/lib/service-display"

export function ServiceCard({ service }) {
  const id = service._id || service.id
  const priceLabel = formatServicePrice(service, "From ")
  const technicianName = getTechnician(service)?.name ?? "Technician"
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-muted">
        <ServiceImage
          src={service.image}
          alt={service.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
            {service.category}
          </span>
          <span className="capitalize">{service.serviceMode}</span>
        </div>
        <h3 className="line-clamp-2 text-base font-semibold">{service.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          by {technicianName}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <p className="font-semibold text-primary">{priceLabel}</p>
        </div>
        <div className="mt-4 pt-2">
          <Button asChild className="w-full">
            <Link href={`/services/${id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
