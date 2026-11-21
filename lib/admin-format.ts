const numberFormatter = new Intl.NumberFormat("en-US")

export function formatNumber(value: unknown) {
  const number = Number(value)
  return numberFormatter.format(Number.isFinite(number) ? number : 0)
}

export function formatMoney(value: unknown, currency = "usd") {
  const number = Number(value)
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(Number.isFinite(number) ? number : 0)
  } catch {
    return `$${formatNumber(number)}`
  }
}

export function formatDate(value: unknown) {
  if (!value) return "—"
  const date = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date)
}
