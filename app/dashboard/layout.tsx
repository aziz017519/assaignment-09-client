import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let role: "customer" | "technician" | "admin" = "customer"
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    const r = (session?.user as any)?.role
    if (r === "admin" || r === "technician" || r === "customer") role = r
  } catch {
    // middleware handles redirects; keep safe fallback
  }
  return <DashboardShell role={role}>{children}</DashboardShell>
}
