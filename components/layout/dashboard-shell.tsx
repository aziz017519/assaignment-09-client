"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { DashboardTopbar } from "@/components/layout/dashboard-topbar"
import { ApiUnauthorizedHandler } from "@/components/auth/api-unauthorized-handler"

export function DashboardShell({
  role,
  children,
}: {
  role: "customer" | "technician" | "admin"
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen bg-muted/20 lg:flex">
      <ApiUnauthorizedHandler />
      <DashboardSidebar role={role} open={open} onClose={() => setOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <DashboardTopbar onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
