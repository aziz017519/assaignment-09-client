import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { Service } from "@/types"

// Backend services use `basePrice`; older shapes may use `price` instead.
// Decimal/BigInt/string values are normalized here so the card never shows
// an empty "From $".
function toPriceNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null
  }
  if (typeof value === "bigint") {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  }
  if (typeof value === "object") {
    const decimal = value as {
      $numberDecimal?: unknown
      toNumber?: () => number
      toString?: () => string
    }
    if (typeof decimal.toNumber === "function") {
      const parsed = decimal.toNumber()
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null
    }
    if (decimal.$numberDecimal !== undefined) {
      return toPriceNumber(decimal.$numberDecimal)
    }
    if (typeof decimal.toString === "function") {
      return toPriceNumber(decimal.toString())
    }
    return null
  }
  const text = String(value).replace(/,/g, "").replace(/[^0-9.]/g, "")
  if (!text) return null
  const parsed = Number(text)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function formatPrice(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

export function ServiceCard({ service }: { service: Service }) {
  const id = service._id || service.id
  const price = toPriceNumber(
    service.basePrice ??
      service.price ??
      service.startingPrice ??
      service.minPrice ??
      service.pricing?.amount,
  )
  const technicianName =
    service.technicianName ||
    service.technician?.name ||
    service.provider?.name ||
    "Technician"
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-muted">
        {service.image ? (
          <Image
            src={service.image}
            alt={service.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
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
          <p className="font-semibold text-primary">
            {price === null ? "Price on request" : `From $${formatPrice(price)}`}
          </p>
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
