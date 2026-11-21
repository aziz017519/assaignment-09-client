"use client"

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
import { EmptyState } from "@/components/shared/empty-state"
import type { TechnicianMonthPoint, TechnicianStatusCount } from "@/types/technician"

const SERIES = [
  { key: "requested", name: "Requested", color: "#f59e0b" },
  { key: "completed", name: "Completed", color: "#22c55e" },
  { key: "cancelled", name: "Cancelled", color: "#ef4444" },
] as const

export function TechnicianRequestsChart({
  data,
  statusBreakdown,
  loading,
}: {
  data: TechnicianMonthPoint[]
  statusBreakdown: TechnicianStatusCount[]
  loading: boolean
}) {
  if (loading) {
    return <div className="mt-4 h-[300px] animate-pulse rounded-lg bg-muted/60" aria-busy="true" />
  }

  const hasRequests = statusBreakdown.some((item) => item.count > 0)

  if (!hasRequests) {
    return (
      <EmptyState
        title="No requests yet"
        description="Requests for your services will appear here once customers send them."
        className="mt-4 min-h-[300px]"
      />
    )
  }

  return (
    <div className="mt-4 h-[300px] w-full" aria-label="Requests per month over the last 6 months">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
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
            cursor={{ fill: "#14b8a6", fillOpacity: 0.08 }}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--card-foreground)",
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--muted-foreground)" }}
            formatter={(value) => [Number(value).toLocaleString(), "Requests"]}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ paddingTop: 12, color: "var(--muted-foreground)", fontSize: 12 }}
          />
          {SERIES.map((series) => (
            <Bar
              key={series.key}
              dataKey={series.key}
              name={series.name}
              stackId="requests"
              fill={series.color}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
