"use client"

import { useCallback, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { api } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { onPaymentConfirmed } from "@/lib/payment-events"
import type { SubscriptionStatus } from "@/types"

// Shared technician-only plan state. Non-technicians never call the endpoint.
export function useSubscription() {
  const { data: session } = authClient.useSession()
  const role = (session?.user as { role?: string } | undefined)?.role
  const pathname = usePathname()
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (role !== "technician") return
    setLoading(true)
    setError(null)
    try {
      const body = await api.get<{ data: SubscriptionStatus }>("/api/subscription")
      setStatus(body.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load subscription")
    } finally {
      setLoading(false)
    }
  }, [role])

  useEffect(() => {
    // Run after the effect body so the compiler does not see a cascading render.
    void Promise.resolve().then(refresh)
  }, [refresh, pathname])

  useEffect(() => {
    const stopListening = onPaymentConfirmed((detail) => {
      if (detail.type === "subscription") void refresh()
    })
    const onFocus = () => void refresh()
    window.addEventListener("focus", onFocus)
    return () => {
      stopListening()
      window.removeEventListener("focus", onFocus)
    }
  }, [refresh])

  return { status, loading, error, refresh }
}
