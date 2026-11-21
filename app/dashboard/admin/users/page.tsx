"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { ConfirmModal } from "@/components/shared/confirm-modal"
import {
  AdminErrorBanner,
  AdminPagination,
  AdminSelect,
  AdminStatusBadge,
  AdminToolbar,
  adminFieldClass,
} from "@/components/admin/admin-filters"
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table"
import { useAdminUsers } from "@/hooks/use-admin-users"
import { formatDate } from "@/lib/admin-format"
import { ADMIN_USER_ROLES, type AdminUser } from "@/types/admin"
import type { Role } from "@/types"

const roleTone: Record<Role, "blue" | "green" | "gray"> = {
  admin: "blue",
  technician: "green",
  customer: "gray",
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function UsersContent() {
  const {
    rows,
    meta,
    loading,
    error,
    filters,
    searchInput,
    setSearchInput,
    setFilter,
    retry,
    updateRole,
  } = useAdminUsers()
  const { data: session } = authClient.useSession()
  const currentEmail = (session?.user?.email ?? "").toLowerCase()
  const [pending, setPending] = useState<{ user: AdminUser; role: Role } | null>(null)
  const [saving, setSaving] = useState(false)

  const confirmRoleChange = useCallback(async () => {
    if (!pending) return
    setSaving(true)
    try {
      await updateRole(pending.user.id, pending.role)
      toast.success(`${pending.user.name} is now ${pending.role}`)
      setPending(null)
      retry()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update role")
    } finally {
      setSaving(false)
    }
  }, [pending, retry, updateRole])

  const columns: AdminColumn<AdminUser>[] = [
    {
      key: "user",
      header: "User",
      render: (user) => (
        <div className="flex items-center gap-3">
          {user.image || user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image || user.avatar || ""}
              alt=""
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials(user.name)}
            </span>
          )}
          <span className="font-medium">{user.name}</span>
        </div>
      ),
    },
    { key: "email", header: "Email", render: (user) => user.email },
    { key: "phone", header: "Phone", render: (user) => user.phone || "—" },
    {
      key: "role",
      header: "Role",
      render: (user) => (
        <AdminStatusBadge label={user.role} tone={roleTone[user.role] ?? "gray"} />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => (
        <AdminStatusBadge
          label={user.emailVerified ? "Verified" : "Unverified"}
          tone={user.emailVerified ? "green" : "amber"}
        />
      ),
    },
    { key: "joined", header: "Joined", render: (user) => formatDate(user.createdAt) },
    {
      key: "actions",
      header: "Actions",
      render: (user) => {
        const isSelf = user.email.toLowerCase() === currentEmail
        return (
          <select
            aria-label={`Change role for ${user.name}`}
            title={isSelf ? "You cannot change your own role" : "Change role"}
            disabled={isSelf || loading}
            value={user.role}
            onChange={(event) => setPending({ user, role: event.target.value as Role })}
            className={`${adminFieldClass} ${isSelf ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {ADMIN_USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">View users and manage roles. Admin cannot change their own role.</p>
      </div>

      <AdminErrorBanner error={error} onRetry={retry} loading={loading} />

      <AdminToolbar
        search={searchInput}
        onSearch={setSearchInput}
        placeholder="Search name, email or phone"
        sort={filters.sort ?? "newest"}
        onSort={(value) => setFilter("sort", value)}
        sortOptions={[
          { label: "Newest", value: "newest" },
          { label: "Oldest", value: "oldest" },
          { label: "Name A-Z", value: "name_asc" },
          { label: "Name Z-A", value: "name_desc" },
          { label: "Role", value: "role_asc" },
        ]}
      >
        <AdminSelect
          label="Role"
          value={filters.role}
          options={ADMIN_USER_ROLES}
          onChange={(value) => setFilter("role", value)}
        />
        <AdminSelect
          label="Status"
          value={filters.status}
          options={["verified", "unverified"]}
          onChange={(value) => setFilter("status", value)}
        />
      </AdminToolbar>

      <AdminTable
        columns={columns}
        rows={rows}
        rowKey={(user) => user.id}
        loading={loading}
        emptyTitle="No users found"
        emptyDescription="Try a different search or filter."
      />

      <AdminPagination meta={meta} onPage={(page) => setFilter("page", String(page))} />

      <ConfirmModal
        open={!!pending}
        title="Change user role"
        description={
          pending
            ? `Change ${pending.user.name}'s role from ${pending.user.role} to ${pending.role}?`
            : undefined
        }
        confirmLabel="Change role"
        loading={saving}
        onConfirm={() => void confirmRoleChange()}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}

export default function AdminUsersPage() {
  return <UsersContent />
}
