"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Wrench,
  PlusCircle,
  ListChecks,
  Users,
  BadgeCheck,
  Crown,
  ReceiptText,
  UserCircle,
  X,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/layout/logo"

const menus: Record<string, { href: string; label: string; icon: LucideIcon }[]> = {
  customer: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/customer/bookings", label: "My Bookings", icon: Calendar },
    { href: "/dashboard/customer/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/customer/profile", label: "Profile", icon: UserCircle },
  ],
  technician: [
    { href: "/dashboard/technician", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/technician/add-service", label: "Add Service", icon: PlusCircle },
    { href: "/dashboard/technician/my-services", label: "My Services", icon: Wrench },
    { href: "/dashboard/technician/requests", label: "Requests", icon: ListChecks },
    { href: "/dashboard/technician/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/technician/subscription", label: "Subscription", icon: Crown },
    { href: "/dashboard/technician/profile", label: "Profile", icon: UserCircle },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/services", label: "Services", icon: BadgeCheck },
    { href: "/dashboard/admin/bookings", label: "Bookings", icon: Calendar },
    { href: "/dashboard/admin/transactions", label: "Transactions", icon: ReceiptText },
    { href: "/dashboard/admin/profile", label: "Profile", icon: UserCircle },
  ],
}

export function DashboardSidebar({
  role,
  open,
  onClose,
}: {
  role: "customer" | "technician" | "admin"
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const items = menus[role] || menus.customer

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 lg:hidden",
          open ? "block" : "hidden"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Logo />
          <button className="rounded-md p-1 hover:bg-muted lg:hidden" onClick={onClose} aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {items.map((item) => {
            const Icon = item.icon
            const active =
              item.href === `/dashboard/${role}`
                ? pathname === item.href
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
