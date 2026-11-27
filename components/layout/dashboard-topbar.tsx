"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import type { User } from "@/types"

export function DashboardTopbar({ onMenu }: { onMenu: () => void }) {
  const { data: session } = authClient.useSession()
  const user = session?.user as Partial<User> | null | undefined
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <button className="rounded-md p-2 hover:bg-muted lg:hidden" onClick={onMenu} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Button variant="outline" size="sm" asChild>
          <Link href="/">Home</Link>
        </Button>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user?.name || "User"} className="h-full w-full object-cover" />
            ) : (
              (user?.name || "U").slice(0, 1).toUpperCase()
            )}
          </span>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
            <p className="mt-1 text-xs capitalize text-muted-foreground">{user?.role || "customer"}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
