"use client"

import Link from "next/link"
import { Wrench, BadgeCheck, ListChecks, RefreshCw } from "lucide-react"
import { TechnicianRequestsChart } from "@/components/dashboard/technician-requests-chart"
import { StatsCard } from "@/components/shared/stats-card"
import { VerifiedProBadge } from "@/components/shared/verified-pro-badge"
import { Button } from "@/components/ui/button"
import { useTechnicianStats } from "@/hooks/use-technician-stats"

const formatNumber = (value: number) => new Intl.NumberFormat().format(value)

function StatSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm" aria-hidden="true">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-8 w-16 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-1.5 w-full animate-pulse rounded bg-muted" />
    </div>
  )
}

export default function TechnicianOverviewPage() {
  const { stats, loading, error, errorStatus, retry } = useTechnicianStats()

  const serviceLimit = stats?.serviceLimit ?? null
  const isPro = serviceLimit === null && !!stats
  const atLimit = serviceLimit !== null && !!stats && stats.totalServices >= serviceLimit
  const progress =
    serviceLimit !== null && serviceLimit > 0 && stats
      ? Math.min(100, (stats.totalServices / serviceLimit) * 100)
      : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Technician Overview</h1>
          <p className="text-muted-foreground">Manage your services and incoming repair requests.</p>
        </div>
        {isPro ? <VerifiedProBadge /> : null}
      </div>

      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <div className="flex gap-2">
            {errorStatus === 401 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href="/sign-in?redirect=%2Fdashboard%2Ftechnician">Sign in</Link>
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={retry}>
              <RefreshCw className="size-4" /> Try again
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && !stats ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : stats ? (
          <>
            <StatsCard
              title="Total Services"
              value={
                serviceLimit === null
                  ? formatNumber(stats.totalServices)
                  : `${formatNumber(stats.totalServices)} / ${formatNumber(serviceLimit)}`
              }
              icon={Wrench}
              footer={
                serviceLimit === null ? undefined : (
                  <div>
                    <div
                      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-label="Services used"
                      aria-valuemin={0}
                      aria-valuemax={serviceLimit}
                      aria-valuenow={stats.totalServices}
                    >
                      <div
                        className="h-full rounded-full bg-teal-500 transition-all dark:bg-teal-400"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>of {formatNumber(serviceLimit)} on Free plan</span>
                      {atLimit ? (
                        <Link
                          href="/dashboard/technician/subscription"
                          className="font-medium text-teal-600 hover:underline dark:text-teal-300"
                        >
                          Upgrade
                        </Link>
                      ) : null}
                    </div>
                  </div>
                )
              }
            />
            <StatsCard
              title="Approved Services"
              value={formatNumber(stats.approvedServices)}
              icon={BadgeCheck}
            />
            <StatsCard
              title="Pending Requests"
              value={formatNumber(stats.pendingRequests)}
              icon={ListChecks}
            />
          </>
        ) : null}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Requests Chart</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Request status and trends over the last 6 months.
        </p>
        {error && !stats ? (
          <div className="mt-4 flex h-[300px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Stats unavailable. Use “Try again” to reload.
          </div>
        ) : (
          <TechnicianRequestsChart
            data={stats?.requestsByMonth ?? []}
            statusBreakdown={stats?.requestsByStatus ?? []}
            loading={loading && !stats}
          />
        )}
      </div>
    </div>
  )
}
