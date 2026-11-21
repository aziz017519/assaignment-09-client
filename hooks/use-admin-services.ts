"use client"

import { useCallback } from "react"
import { api } from "@/lib/api"
import { useAdminList } from "@/hooks/use-admin-list"
import type { ApprovalStatus } from "@/types"
import type { AdminService } from "@/types/admin"

export function useAdminServices() {
  const list = useAdminList<AdminService>("/api/admin/services")

  const updateStatus = useCallback(async (id: string, status: ApprovalStatus) => {
    await api.patch<unknown>(`/api/admin/services/${id}/status`, { status })
  }, [])

  const deleteService = useCallback(async (id: string) => {
    await api.delete<unknown>(`/api/admin/services/${id}`)
  }, [])

  return { ...list, updateStatus, deleteService }
}
