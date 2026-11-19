import { Calendar, CheckCircle2, Clock } from "lucide-react"
import { StatsCard } from "@/components/shared/stats-card"

export default function CustomerOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Overview</h1>
        <p className="text-muted-foreground">Track your repair requests and recent activity.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Total Requests" value="—" icon={Calendar} />
        <StatsCard title="Active Jobs" value="—" icon={Clock} />
        <StatsCard title="Completed Jobs" value="—" icon={CheckCircle2} />
      </div>
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Activity Chart</h2>
        <p className="mt-2 text-sm text-muted-foreground">Connect to the bookings API to visualize request activity over time (e.g. with Recharts).</p>
        <div className="mt-4 flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">Chart placeholder</div>
      </div>
    </div>
  )
}
