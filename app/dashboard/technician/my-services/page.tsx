"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, RefreshCw, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { VerifiedProBadge } from "@/components/shared/verified-pro-badge"
import { api } from "@/lib/api"
import { useSubscription } from "@/hooks/use-subscription"
import type { Service } from "@/types"

export default function MyServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { status, loading: planLoading } = useSubscription()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const body = await api.get<{ data: Service[] }>("/api/services/my")
      setServices(Array.isArray(body?.data) ? body.data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load services")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [load])

  const isPro = status?.plan === "pro"
  const atLimit = status?.serviceLimit != null && status.serviceCount >= status.serviceLimit

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">My Services</h1>
            {isPro ? <VerifiedProBadge /> : null}
          </div>
          <p className="mt-1 text-muted-foreground">Manage your services: edit, delete and toggle availability.</p>
        </div>
        {atLimit ? (
          <Button disabled title="Free plan limit reached">Add service</Button>
        ) : (
          <Button asChild><Link href="/dashboard/technician/add-service">Add service</Link></Button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 text-sm">
        <div className="flex items-center gap-2">
          <Wrench className="size-4 text-muted-foreground" aria-hidden="true" />
          {planLoading && !status ? (
            <span className="text-muted-foreground">Loading plan usage…</span>
          ) : status?.serviceLimit == null ? (
            <span>Unlimited services with Pro</span>
          ) : (
            <span>
              <strong>{status.serviceCount} / {status.serviceLimit}</strong> services used
            </span>
          )}
        </div>
        {status?.plan === "free" ? (
          <Link href="/dashboard/technician/subscription" className="font-medium text-teal-600 hover:underline dark:text-teal-300">
            Upgrade to Pro for unlimited services <ArrowUpRight className="inline size-3.5" />
          </Link>
        ) : null}
      </div>

      {atLimit ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          <span>You have reached the Free plan limit. Existing services stay active, but new ones need Pro.</span>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/technician/subscription">View plans</Link>
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          <div className="h-20 animate-pulse rounded-xl border bg-muted/40" />
          <div className="h-20 animate-pulse rounded-xl border bg-muted/40" />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p>{error}</p>
          <Button className="mt-3" variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="size-4" /> Try again
          </Button>
        </div>
      ) : null}

      {!loading && !error && services.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Add your first service to start receiving repair requests."
          action={
            <Button asChild><Link href="/dashboard/technician/add-service">Add service</Link></Button>
          }
        />
      ) : null}

      {!loading && !error && services.length > 0 ? (
        <ul className="space-y-3">
          {services.map((service) => (
            <li
              key={service._id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30"
            >
              <div className="min-w-0">
                <p className="break-words font-medium">{service.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {service.category} · {service.serviceArea || service.area || "Area not set"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={service.approvalStatus || "pending"} kind="approval" />
                <span className="text-sm font-semibold">${Number(service.basePrice ?? service.price ?? 0)}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
