import Link from "next/link"
import { Suspense } from "react"
import { ServiceCard } from "@/components/services/service-card"
import { EmptyState } from "@/components/shared/empty-state"
import { CATEGORIES, SERVICE_MODES } from "@/lib/constants"
import type { Service } from "@/types"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

async function getServices(params: Record<string, string | string[] | undefined>): Promise<Service[]> {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")
  if (!base) return []
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string" && v) sp.set(k, v)
  }
  if (!sp.has("approved")) sp.set("approved", "true")
  try {
    const res = await fetch(`${base}/api/services?${sp.toString()}`, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : data?.services || data?.data || []
  } catch {
    return []
  }
}

async function ServicesContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const services = await getServices(params)
  const q = typeof params.q === "string" ? params.q : ""
  const category = typeof params.category === "string" ? params.category : ""
  const serviceMode = typeof params.serviceMode === "string" ? params.serviceMode : ""
  const sort = typeof params.sort === "string" ? params.sort : "newest"

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Services</h1>
        <p className="mt-2 text-muted-foreground">Find and book trusted repair services. Search, filter, and sort are handled by the server.</p>
      </div>

      <form className="mb-8 grid grid-cols-1 gap-3 rounded-xl border bg-card p-4 md:grid-cols-4" action="/services" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by title or category"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring md:col-span-2"
        />
        <select name="category" defaultValue={category} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="serviceMode" defaultValue={serviceMode} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All modes</option>
          {SERVICE_MODES.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
        </select>
        <select name="sort" defaultValue={sort} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
        <div className="flex gap-2 md:col-span-3 md:justify-end">
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Apply</button>
          <Link href="/services" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Reset</Link>
        </div>
      </form>

      {services.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service._id || service.id} service={service} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No services found"
          description="Try adjusting your search or filters, or check back later for new approved services."
          action={<Link href="/services" className="text-sm font-medium text-primary hover:underline">Clear filters</Link>}
        />
      )}
    </div>
  )
}

export default function ServicesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl p-6">Loading services...</div>}>
      <ServicesContent searchParams={searchParams} />
    </Suspense>
  )
}
