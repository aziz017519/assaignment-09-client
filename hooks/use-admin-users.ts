"use client"

import { useCallback } from "react"
import { api } from "@/lib/api"
import { useAdminList } from "@/hooks/use-admin-list"
import type { Role } from "@/types"
import type { AdminUser } from "@/types/admin"

export function useAdminUsers() {
  const list = useAdminList<AdminUser>("/api/admin/users")

  const updateRole = useCallback(async (id: string, role: Role) => {
    await api.patch<unknown>(`/api/admin/users/${id}/role`, { role })
  }, [])

  return { ...list, updateRole }
}
