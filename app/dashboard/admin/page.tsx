"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { BadgeCheck, RefreshCw, UserCog, Users } from "lucide-react"
import { StatsCard } from "@/components/shared/stats-card"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { ApiError, api, clearApiToken } from "@/lib/api"

type ChartPoint = {
  label: string
  users: number
  bookings: number
}

type AdminStats = {
  totalUsers: number
  totalTechnicians: number
  pendingServices: number
  totalBookings: number
  totalRevenue: number
  chart: ChartPoint[]
}

const numberFormatter = new Intl.NumberFormat("en-US")

function formatNumber(value: number) {
  return numberFormatter.format(Number.isFinite(value) ? value : 0)
}

function parseStats(body: unknown): AdminStats {
  // Express sendSuccess() wraps the payload in { success: true, data: ... }.
  const raw =
    body && typeof body === "object" && "data" in body
      ? (body as { data: unknown }).data
      : body
  const data = (raw ?? {}) as Partial<AdminStats>
  const chart = Array.isArray(data.chart)
    ? data.chart
        .filter((point): point is ChartPoint => !!point && typeof point === "object")
        .map((point) => ({
          label: String(point.label ?? ""),
          users: Number(point.users) || 0,
          bookings: Number(point.bookings) || 0,
        }))
    : []

  return {
    totalUsers: Number(data.totalUsers) || 0,
    totalTechnicians: Number(data.totalTechnicians) || 0,
    pendingServices: Number(data.pendingServices) || 0,
    totalBookings: Number(data.totalBookings) || 0,
    totalRevenue: Number(data.totalRevenue) || 0,
    chart,
  }
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const body = await api.get<unknown>("/api/admin/stats")
      setStats(parseStats(body))
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("You are not allowed to view this page")
      } else if (err instanceof ApiError && err.status === 401) {
        // api.ts dispatches api:unauthorized, which signs out and redirects.
        setError("Your session has expired. Redirecting to sign in…")
      } else {
        setError(err instanceof Error ? err.message : "Could not load platform stats.")
      }
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

  const hasChartData =
    !!stats?.chart.some((point) => point.users > 0 || point.bookings > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">Monitor platform users, services, bookings, and transactions.</p>
      </div>

      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={retry} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Retry
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && !stats ? (
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
            <StatsCard
              title="Total Users"
              value={stats ? formatNumber(stats.totalUsers) : "N/A"}
              icon={Users}
            />
            <StatsCard
              title="Total Technicians"
              value={stats ? formatNumber(stats.totalTechnicians) : "N/A"}
              icon={UserCog}
            />
            <StatsCard
              title="Pending Services"
              value={stats ? formatNumber(stats.pendingServices) : "N/A"}
              icon={BadgeCheck}
            />
          </>
        )}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Platform Chart</h2>
        <p className="mt-2 text-sm text-muted-foreground">Visualize users, services, or bookings data from the server with charts.</p>

        {loading && !stats ? (
          <div className="mt-4 h-64 animate-pulse rounded-lg bg-muted/60" />
        ) : error && !stats ? (
          <div className="mt-4 flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Stats unavailable. Use “Retry” to reload.
          </div>
        ) : !hasChartData ? (
          <EmptyState
            title="No data yet"
            description="New users and bookings will appear here once activity is recorded."
            className="mt-4 min-h-64"
          />
        ) : (
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.chart ?? []}
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
                />
                <Legend
                  wrapperStyle={{ color: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Bar
                  dataKey="users"
                  name="New users"
                  fill="var(--chart-1)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="bookings"
                  name="Bookings"
                  fill="var(--chart-2)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
