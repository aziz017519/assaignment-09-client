"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { ApiError, api, clearApiToken } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { onTechnicianDataChange } from "@/lib/technician-events"
import type { TechnicianStats, TechnicianStatsResponse } from "@/types/technician"

function errorMessage(error: unknown, status: number | null) {
  if (status === 403) return "You are not allowed to view this page"
  if (status === 401) return "Your session expired. Please sign in again."
  return error instanceof Error ? error.message : "Failed to load technician stats"
}

/** Technician-only overview stats, refetched on focus and data-change events. */
export function useTechnicianStats() {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const role = (session?.user as { role?: string } | undefined)?.role
  const pathname = usePathname()

  const [stats, setStats] = useState<TechnicianStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorStatus, setErrorStatus] = useState<number | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const requestIdRef = useRef(0)

  const refresh = useCallback(async () => {
    if (role !== "technician") return
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)
    setErrorStatus(null)
    try {
      const body = await api.get<TechnicianStatsResponse>("/api/technician/stats")
      if (requestId !== requestIdRef.current) return
      setStats(body.data)
    } catch (error) {
      if (requestId !== requestIdRef.current) return
      const status = error instanceof ApiError ? error.status : null
      setErrorStatus(status)
      setError(errorMessage(error, status))
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [role])

  useEffect(() => {
    void Promise.resolve().then(() => {
      if (sessionPending) return
      if (role !== "technician") {
        setLoading(false)
        setError("You are not allowed to view this page")
        setErrorStatus(403)
        return
      }
      void refresh()
    })
  }, [refresh, sessionPending, role, pathname, reloadKey])

  useEffect(() => {
    const stopListening = onTechnicianDataChange(() => void refresh())
    const onFocus = () => void refresh()
    window.addEventListener("focus", onFocus)
    return () => {
      stopListening()
      window.removeEventListener("focus", onFocus)
    }
  }, [refresh])

  const retry = useCallback(() => {
    clearApiToken()
    setReloadKey((key) => key + 1)
  }, [])

  return { stats, loading, error, errorStatus, refresh, retry }
}
