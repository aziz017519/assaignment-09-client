"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"

let handling = false

/** Signs the user out and returns to sign-in when the API rejects the session. */
export function ApiUnauthorizedHandler() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function onUnauthorized() {
      if (handling) return
      handling = true
      try {
        await authClient.signOut()
      } finally {
        router.push(`/sign-in?redirect=${encodeURIComponent(pathname || "/dashboard")}`)
        router.refresh()
        handling = false
      }
    }
    const onForbidden = () => {
      toast.error("You are not allowed to do this")
    }
    window.addEventListener("api:unauthorized", onUnauthorized)
    window.addEventListener("api:forbidden", onForbidden)
    return () => {
      window.removeEventListener("api:unauthorized", onUnauthorized)
      window.removeEventListener("api:forbidden", onForbidden)
    }
  }, [router, pathname])

  return null
}
