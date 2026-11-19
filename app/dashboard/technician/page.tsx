import { Wrench, BadgeCheck, ListChecks } from "lucide-react"
import { StatsCard } from "@/components/shared/stats-card"

export default function TechnicianOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Technician Overview</h1>
        <p className="text-muted-foreground">Manage your services and incoming repair requests.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Total Services" value="—" icon={Wrench} />
        <StatsCard title="Approved Services" value="—" icon={BadgeCheck} />
        <StatsCard title="Pending Requests" value="—" icon={ListChecks} />
      </div>
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Requests Chart</h2>
        <p className="mt-2 text-sm text-muted-foreground">Connect to the server API to chart request statuses and trends.</p>
        <div className="mt-4 flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">Chart placeholder</div>
      </div>
    </div>
  )
}
