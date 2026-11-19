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
