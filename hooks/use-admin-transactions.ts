"use client"

import { useAdminList } from "@/hooks/use-admin-list"
import type { AdminTransaction } from "@/types/admin"

export function useAdminTransactions() {
  return useAdminList<AdminTransaction>("/api/admin/transactions")
}
