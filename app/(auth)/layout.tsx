import Link from "next/link"
import { Logo } from "@/components/layout/logo"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to Home
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        {children}
      </main>
    </div>
  )
}
