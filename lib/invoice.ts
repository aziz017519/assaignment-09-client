import { apiFetchBlob } from "@/lib/api"

/**
 * Fetch a paid booking's PDF with the bearer header and save it using the
 * server-provided filename. The temporary object URL is always released.
 */
export async function downloadInvoicePdf(bookingId: string): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Invoices can only be downloaded in the browser.")
  }

  const { blob, filename } = await apiFetchBlob(
    `/api/bookings/${encodeURIComponent(bookingId)}/invoice`
  )

  if (!blob.size) {
    throw new Error("The invoice response was empty.")
  }
  if (blob.type && !blob.type.toLowerCase().includes("pdf")) {
    throw new Error("The invoice response was not a PDF.")
  }

  const url = URL.createObjectURL(blob)
  try {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.rel = "noopener"
    document.body.appendChild(link)
    link.click()
    link.remove()
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return filename
}
