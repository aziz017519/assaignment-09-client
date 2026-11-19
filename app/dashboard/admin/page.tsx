import { Users, UserCog, BadgeCheck } from "lucide-react"
import { StatsCard } from "@/components/shared/stats-card"

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">Monitor platform users, services, bookings, and transactions.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Total Users" value="—" icon={Users} />
        <StatsCard title="Total Technicians" value="—" icon={UserCog} />
        <StatsCard title="Pending Services" value="—" icon={BadgeCheck} />
      </div>
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Platform Chart</h2>
        <p className="mt-2 text-sm text-muted-foreground">Visualize users, services, or bookings data from the server with charts.</p>
        <div className="mt-4 flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">Chart placeholder</div>
      </div>
    </div>
  )
}
