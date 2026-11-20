"use client"

import { useRef, useState, useSyncExternalStore } from "react"
import { Check, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { VerifiedProBadge } from "@/components/shared/verified-pro-badge"
import { api } from "@/lib/api"
import { useSubscription } from "@/hooks/use-subscription"

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatPrice(price: { amount: number; currency: string; interval: string } | null) {
  if (!price) return "Billed monthly through Stripe"
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency.toUpperCase(),
    minimumFractionDigits: Number.isInteger(price.amount) ? 0 : 2,
  }).format(price.amount)
  return `${amount} / ${price.interval}`
}

function formatDate(value: string | null) {
  if (!value) return "Not available"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Not available" : dateFormatter.format(date)
}

function useStatusMessage() {
  return useSyncExternalStore(
    () => () => {},
    () => (typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("status")),
    () => null,
  )
}

export function SubscriptionContent() {
  const statusMessage = useStatusMessage()
  const { status, loading, error, refresh } = useSubscription()
  const [action, setAction] = useState<"checkout" | "portal" | null>(null)
  const actionInFlight = useRef(false)

  async function startStripeSession(kind: "checkout" | "portal") {
    if (actionInFlight.current) return
    actionInFlight.current = true
    setAction(kind)
    try {
      const body = await api.post<{ data: { url: string } }>(`/api/subscription/${kind}`)
      if (!body?.data?.url) throw new Error("Stripe did not return a checkout URL")
      window.location.href = body.data.url
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open Stripe")
      setAction(null)
    } finally {
      actionInFlight.current = false
    }
  }

  const isPro = status?.plan === "pro"
  const atLimit = status != null && status.serviceLimit != null && status.serviceCount >= status.serviceLimit

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">Choose the plan that fits your repair business.</p>
      </div>

      {statusMessage === "success" ? (
        <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 p-4 text-sm text-teal-800 dark:text-teal-200">
          Checkout finished. Your plan updates automatically once Stripe confirms the payment — no action needed here.
        </div>
      ) : null}
      {statusMessage === "cancelled" ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          Checkout was cancelled. Your current plan has not changed.
        </div>
      ) : null}

      {loading && !status ? (
        <div className="h-36 animate-pulse rounded-xl border bg-muted/40" aria-busy="true" />
      ) : null}

      {error && !status ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => void refresh()}>Try again</Button>
        </div>
      ) : null}

      {status ? (
        <section className="rounded-xl border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current plan</p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold capitalize">{status.plan}</h2>
                {isPro ? <VerifiedProBadge /> : null}
              </div>
            </div>
            {isPro ? (
              <Button
                variant="outline"
                disabled={action !== null}
                onClick={() => void startStripeSession("portal")}
              >
                {action === "portal" ? <Loader2 className="size-4 animate-spin" /> : null}
                Manage subscription
              </Button>
            ) : (
              <Button disabled={action !== null} onClick={() => void startStripeSession("checkout")}>
                {action === "checkout" ? <Loader2 className="size-4 animate-spin" /> : null}
                Upgrade to Pro
              </Button>
            )}
          </div>
          <div className="mt-5 grid gap-4 border-t pt-5 text-sm sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Service listings</p>
              <p className="mt-1 font-semibold">
                {status.serviceLimit == null
                  ? "Unlimited"
                  : `${status.serviceCount} / ${status.serviceLimit} used`}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Verified badge</p>
              <p className="mt-1 font-semibold">{isPro ? "Visible on your dashboard" : "Not included"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{isPro ? "Renews on" : "Renewal"}</p>
              <p className="mt-1 font-semibold">{isPro ? formatDate(status.planExpiresAt) : "—"}</p>
            </div>
          </div>
          {atLimit ? (
            <p className="mt-4 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
              You have reached the Free plan limit. Upgrade to Pro to add more services.
            </p>
          ) : null}
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5 sm:p-6">
          <h3 className="text-lg font-semibold">Free</h3>
          <p className="mt-1 text-sm text-muted-foreground">For technicians getting started.</p>
          <p className="mt-5 text-2xl font-bold">$0 <span className="text-sm font-normal text-muted-foreground">forever</span></p>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-teal-500" />Up to 3 service listings</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-teal-500" />Manage repair requests</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-teal-500" />Standard dashboard profile</li>
          </ul>
          {!isPro && status ? (
            <p className="mt-6 rounded-lg bg-muted p-3 text-center text-sm font-medium">Your current plan</p>
          ) : null}
        </section>

        <section className="rounded-xl border border-teal-500/50 bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Pro Technician</h3>
            <Sparkles className="size-5 text-teal-500" aria-hidden="true" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">For busy professionals who need room to grow.</p>
          <p className="mt-5 text-2xl font-bold">{formatPrice(status?.price ?? null)}</p>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-teal-500" />Unlimited service listings</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-teal-500" />Teal “Verified Pro” badge</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-teal-500" />Manage or cancel anytime in Stripe</li>
          </ul>
          {isPro ? (
            <p className="mt-6 rounded-lg bg-teal-500/10 p-3 text-center text-sm font-medium text-teal-700 dark:text-teal-300">
              Your current plan
            </p>
          ) : (
            <Button
              className="mt-6 w-full"
              disabled={action !== null || loading}
              onClick={() => void startStripeSession("checkout")}
            >
              {action === "checkout" ? <Loader2 className="size-4 animate-spin" /> : null}
              Upgrade to Pro
            </Button>
          )}
        </section>
      </div>
    </div>
  )
}
