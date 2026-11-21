"use client"

import { useCallback } from "react"
import { api } from "@/lib/api"
import { useAdminList } from "@/hooks/use-admin-list"
import type { BookingStatus } from "@/types"
import type { AdminBooking } from "@/types/admin"

export function useAdminBookings() {
  const list = useAdminList<AdminBooking>("/api/admin/bookings")

  const updateStatus = useCallback(
    async (id: string, status: BookingStatus, finalAmount?: number) => {
      await api.patch<unknown>(`/api/admin/bookings/${id}/status`, {
        status,
        ...(finalAmount === undefined ? {} : { finalAmount }),
      })
    },
    []
  )

  return { ...list, updateStatus }
}
