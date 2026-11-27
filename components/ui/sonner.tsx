"use client"

import { useEffect, useState, type ComponentProps } from "react"
import { useTheme } from "next-themes"
import { Toaster as SonnerToaster } from "sonner"

/** Keep sonner's rich colors aligned with the selected (not just system) theme. */
export function Toaster(props: ComponentProps<typeof SonnerToaster>) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    void Promise.resolve().then(() => setMounted(true))
  }, [])

  return (
    <SonnerToaster
      {...props}
      theme={mounted ? (resolvedTheme === "dark" ? "dark" : "light") : "system"}
    />
  )
}
