import { EmptyState } from "@/components/shared/empty-state"

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">View users and manage roles. Admin cannot change their own role.</p>
      </div>
      <EmptyState title="No users loaded" description="Connect to the admin users API to list and manage user roles." />
    </div>
  )
}
