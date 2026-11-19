"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Logo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { dashboardPathForRole } from "@/lib/constants"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "How It Works" },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const user = session?.user as any

  async function handleSignOut() {
    try {
      await authClient.signOut()
      toast.success("Signed out successfully")
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Failed to sign out")
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  active ? "bg-muted text-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isPending ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border px-2 py-1.5 hover:bg-muted"
              >
                <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                  ) : (
                    (user.name || "U").slice(0, 1).toUpperCase()
                  )}
                </span>
                <span className="max-w-[120px] truncate text-sm">{user.name}</span>
              </button>
              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-popover p-2 shadow-lg">
                  <div className="px-2 py-1.5">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="text-xs capitalize text-muted-foreground">{user.role || "customer"}</p>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <Link
                    href={dashboardPathForRole(user.role)}
                    className="block rounded-md px-2 py-2 text-sm hover:bg-muted"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    className="block rounded-md px-2 py-2 text-sm hover:bg-muted"
                    onClick={() => setMenuOpen(false)}
                  >
                    Update Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full rounded-md px-2 py-2 text-left text-sm text-destructive hover:bg-muted"
                  >
                    Sign Out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t bg-background md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
            {links.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium",
                    active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="mt-2 border-t pt-2">
              {user ? (
                <div className="space-y-1">
                  <Link href={dashboardPathForRole(user.role)} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm hover:bg-muted">Dashboard</Link>
                  <Link href="/dashboard/profile" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm hover:bg-muted">Update Profile</Link>
                  <button onClick={handleSignOut} className="block w-full rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-muted">Sign Out</button>
                </div>
              ) : (
                <div className="flex gap-2 px-1">
                  <Button variant="outline" asChild className="flex-1">
                    <Link href="/sign-in" onClick={() => setOpen(false)}>Sign In</Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/sign-up" onClick={() => setOpen(false)}>Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
