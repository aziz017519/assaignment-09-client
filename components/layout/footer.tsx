import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { CATEGORIES } from "@/lib/constants"

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2H21.5l-7.116 8.134L22.75 22h-6.554l-5.133-6.708L5.19 22H1.932l7.61-8.7L1.5 2h6.72l4.64 6.134L18.244 2Zm-1.141 17.966h1.818L7.24 3.927H5.29l11.813 16.039Z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M22 12.06C22 6.504 17.523 2 12 2S2 6.504 2 12.06c0 5.022 3.657 9.188 8.438 9.94v-7.034H7.898v-2.906h2.54V9.845c0-2.522 1.492-3.915 3.777-3.915 1.094 0 2.238.197 2.238.197v2.476h-1.26c-1.243 0-1.63.776-1.63 1.572v1.885h2.773l-.443 2.906h-2.33V22c4.78-.752 8.437-4.918 8.437-9.94Z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5Zm8.88 1.94a1.13 1.13 0 1 1 0 2.25 1.13 1.13 0 0 1 0-2.25ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            FixMate connects you with trusted technicians for smart device and home appliance repairs—fast, reliable, and hassle-free.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
            <li><Link href="/services" className="hover:text-foreground">Services</Link></li>
            <li><Link href="/about" className="hover:text-foreground">How It Works</Link></li>
            <li><Link href="/sign-in" className="hover:text-foreground">Sign In</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Popular Categories</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c}>
                <Link href={`/services?category=${encodeURIComponent(c)}`} className="hover:text-foreground">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Contact</h3>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4" /><span>support@fixmate.example</span></li>
            <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4" /><span>+1 (555) 123-4567</span></li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4" /><span>123 Repair Ave, Service City</span></li>
          </ul>
          <div className="mt-4 flex items-center gap-3 text-muted-foreground">
            <a href="#" aria-label="X" className="hover:text-foreground"><XIcon className="h-4 w-4" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-foreground"><FacebookIcon className="h-4 w-4" /></a>
            <a href="#" aria-label="Instagram" className="hover:text-foreground"><InstagramIcon className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} FixMate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
