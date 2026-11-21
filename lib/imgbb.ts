export const IMAGE_INPUT_ACCEPT = "image/jpeg,image/png,image/webp"
export const MAX_IMAGE_SIZE = 4 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

/** Shared client-side validation for image pickers. Returns an error message or null. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Only JPG, PNG or WEBP allowed"
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return "Image must be under 4MB"
  }
  return null
}

export async function uploadImageToImgbb(file: File): Promise<string> {
  const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY
  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_IMGBB_API_KEY")
  }

  const formData = new FormData()
  formData.append("image", file)

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
    method: "POST",
    body: formData,
  })

  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.success || !data?.data?.url) {
    throw new Error(data?.error?.message || "Image upload failed")
  }

  return data.data.url as string
}
