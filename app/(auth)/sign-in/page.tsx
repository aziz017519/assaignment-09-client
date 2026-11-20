"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { signInSchema, type SignInValues } from "@/lib/validators"
import { authClient } from "@/lib/auth-client"
import { dashboardPathForRole } from "@/lib/constants"
import type { Role } from "@/types"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) })

  async function onSubmit(values: SignInValues) {
    setLoading(true)
    try {
      const res = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      })
      if (res.error) throw new Error(res.error.message || "Sign in failed")
      toast.success("Signed in successfully")
      const role = (res.data?.user as { role?: Role } | null)?.role || "customer"
      const target = redirect && redirect.startsWith("/") ? redirect : dashboardPathForRole(role)
      router.push(target)
      router.refresh()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <p className="mt-1 text-sm text-muted-foreground">Welcome back to FixMate.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            {...register("email")}
          />
          {errors.email ? <p className="mt-1 text-xs text-destructive">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            {...register("password")}
          />
          {errors.password ? <p className="mt-1 text-xs text-destructive">{errors.password.message}</p> : null}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don&apos;t have an account? <Link href={redirect ? `/sign-up?redirect=${encodeURIComponent(redirect)}` : "/sign-up"} className="text-primary hover:underline">Sign Up</Link>
      </p>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md rounded-xl border bg-card p-6">Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}
