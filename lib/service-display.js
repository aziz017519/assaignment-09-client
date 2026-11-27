// Shared service field mapping for cards and the details page.
// Backend services use `basePrice`; older shapes may use `price` instead.

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return null
}

// Normalize number / string / BigInt / Decimal-like values to a positive number.
export function toPriceNumber(value) {
  if (value === null || value === undefined) return null
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null
  }
  if (typeof value === "bigint") {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  }
  if (typeof value === "object") {
    if (typeof value.toNumber === "function") {
      const parsed = value.toNumber()
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null
    }
    if (value.$numberDecimal !== undefined) {
      return toPriceNumber(value.$numberDecimal)
    }
    if (typeof value.toString === "function") {
      return toPriceNumber(value.toString())
    }
    return null
  }
  const text = String(value).replace(/,/g, "").replace(/[^0-9.]/g, "")
  if (!text) return null
  const parsed = Number(text)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export function formatPrice(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

// Ratings arrive as numbers from the API but older records may still be
// strings. Clamp to the supported 1-5 range and keep one decimal place.
export function toRatingNumber(value) {
  const parsed = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return 0
  return Math.round(Math.min(5, parsed) * 10) / 10
}

export function toCountNumber(value) {
  const parsed = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return 0
  return Math.floor(parsed)
}

export function formatRating(value) {
  return toRatingNumber(value).toFixed(1)
}

export function getServicePrice(service) {
  return toPriceNumber(
    service.basePrice ??
      service.price ??
      service.startingPrice ??
      service.minPrice ??
      service.pricing?.amount,
  )
}

export function formatServicePrice(service, prefix = "") {
  const price = getServicePrice(service)
  return price === null ? "Price on request" : `${prefix}$${formatPrice(price)}`
}

export function getServiceDuration(service) {
  return firstNonEmpty(
    service.estimatedDuration,
    service.duration,
    service.estimatedTime,
    typeof service.durationMinutes === "number" && Number.isFinite(service.durationMinutes)
      ? `${service.durationMinutes} minutes`
      : null,
  )
}

function getRawServiceArea(service) {
  return firstNonEmpty(service.serviceArea, service.area, service.location, service.coverageArea)
}

export function getServiceArea(service) {
  return getRawServiceArea(service) ?? firstNonEmpty(service.technician?.area, service.provider?.area)
}

export function getTechnician(service) {
  const technician = service.technician ?? service.provider ?? null
  const name = firstNonEmpty(technician?.name, service.technicianName)
  if (!technician && !name) return null

  return {
    _id: technician?._id,
    id: technician?.id,
    name: name ?? "Technician",
    email: technician?.email ?? service.technicianEmail,
    image: technician?.image ?? null,
    area: firstNonEmpty(technician?.area, service.provider?.area) ?? getRawServiceArea(service) ?? undefined,
    bio: technician?.bio,
  }
}
