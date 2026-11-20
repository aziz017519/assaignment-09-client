import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { dashboardPathForRole } from "@/lib/constants"

export default async function DashboardIndexPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const role = (session?.user as { role?: string | null } | null)?.role || "customer"
  redirect(dashboardPathForRole(role))
}
