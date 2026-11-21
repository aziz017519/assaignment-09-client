import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { profilePathForRole } from "@/lib/constants"

/** Legacy link: send each role to its own shared profile route. */
export default async function LegacyProfilePage() {
  let role: string | null | undefined
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    role = (session?.user as { role?: string | null } | null)?.role
  } catch {
    // Middleware handles unauthenticated requests; fall back to customer.
  }
  redirect(profilePathForRole(role))
}
