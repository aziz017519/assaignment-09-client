"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Calendar, CheckCircle2, Clock, RefreshCw } from "lucide-react"
import { StatsCard } from "@/components/shared/stats-card"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { ApiError, api, clearApiToken } from "@/lib/api"

type ActivityPoint = {
  label: string
  count: number
}

type BookingStats = {
  totalRequests: number
  activeJobs: number
  completedJobs: number
  activity: ActivityPoint[]
}

export default function CustomerOverviewPage() {
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorStatus, setErrorStatus] = useState<number | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    setErrorStatus(null)
    try {
      // Express sendSuccess() wraps the payload in { success: true, data: ... }.
      const body = await api.get<unknown>("/api/bookings/stats")
      const raw =
        body && typeof body === "object" && "data" in body
          ? (body as { data: unknown }).data
          : body
      const data = (raw ?? {}) as Partial<BookingStats>
      setStats({
        totalRequests: Number(data.totalRequests) || 0,
        activeJobs: Number(data.activeJobs) || 0,
        completedJobs: Number(data.completedJobs) || 0,
        activity: Array.isArray(data.activity) ? data.activity : [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your booking stats.")
      setErrorStatus(err instanceof ApiError ? err.status : null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    // Defer state updates out of the effect body to avoid cascading renders.
    void Promise.resolve().then(() => {
      if (active) void loadStats()
    })
    return () => {
      active = false
    }
  }, [loadStats, reloadKey])

  const retry = useCallback(() => {
    clearApiToken()
    setReloadKey((key) => key + 1)
  }, [])

  const hasActivity =
    !!stats?.activity.some((point) => Number(point.count) > 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Overview</h1>
          <p className="text-muted-foreground">Track your repair requests and recent activity.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={retry}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <div className="flex gap-2">
            {errorStatus === 401 || errorStatus === 403 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href="/sign-in?redirect=%2Fdashboard%2Fcustomer">Sign in</Link>
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={retry}>
              Try again
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border bg-card p-5 shadow-sm">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="mt-3 h-8 w-16 rounded bg-muted" />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatsCard title="Total Requests" value={stats?.totalRequests ?? 0} icon={Calendar} />
            <StatsCard title="Active Jobs" value={stats?.activeJobs ?? 0} icon={Clock} />
            <StatsCard title="Completed Jobs" value={stats?.completedJobs ?? 0} icon={CheckCircle2} />
          </>
        )}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <div>
            <h2 className="font-semibold">Activity Chart</h2>
            <p className="mt-1 text-sm text-muted-foreground">Repair requests created over the last 7 days.</p>
          </div>
        </div>

        {loading ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted/60" />
        ) : error && !stats ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Activity unavailable. Use “Try again” to reload.
          </div>
        ) : !hasActivity ? (
          <EmptyState
            title="No activity yet"
            description="Your repair requests will appear here once you send a request."
            className="min-h-64"
          />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.activity ?? []}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--primary)", fillOpacity: 0.08 }}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--card-foreground)",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--muted-foreground)" }}
                  formatter={(value) => [Number(value), "Requests"]}
                />
                <Bar
                  dataKey="count"
                  name="Requests"
                  fill="var(--chart-1)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
