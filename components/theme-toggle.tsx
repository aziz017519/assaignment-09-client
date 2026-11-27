"use client"

import { useEffect, useState } from "react"
import { Monitor, Moon, Sun, SunMoon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const themes = ["light", "dark", "system"] as const
type ThemeChoice = (typeof themes)[number]

const themeNames: Record<ThemeChoice, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Defer to avoid a cascading render during the hydration effect.
    void Promise.resolve().then(() => setMounted(true))
  }, [])

  const current: ThemeChoice =
    theme === "system"
      ? "system"
      : resolvedTheme === "dark"
        ? "dark"
        : "light"
  const next = themes[(themes.indexOf(current) + 1) % themes.length]
  const label = mounted
    ? `Theme: ${themeNames[current]}. Switch to ${themeNames[next]}`
    : "Change theme"

  const Icon = !mounted
    ? SunMoon
    : current === "system"
      ? Monitor
      : current === "dark"
        ? Moon
        : Sun

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={() => setTheme(next)}
      className={cn("size-9", className)}
    >
      <Icon aria-hidden="true" />
    </Button>
  )
}
