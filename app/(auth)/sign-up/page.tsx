"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { signUpSchema, type SignUpValues } from "@/lib/validators"
import { authClient } from "@/lib/auth-client"
import { dashboardPathForRole } from "@/lib/constants"
import type { Role } from "@/types"

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { role: "customer" },
  })
  const role = useWatch({ control, name: "role" })

  async function onSubmit(values: SignUpValues) {
    setLoading(true)
    try {
      const res = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        // @ts-expect-error additional field
        role: values.role,
      })
      if (res.error) throw new Error(res.error.message || "Sign up failed")
      toast.success("Account created successfully")
      const userRole = (res.data?.user as { role?: Role } | null)?.role || values.role || "customer"
      const target = redirect && redirect.startsWith("/") ? redirect : dashboardPathForRole(userRole)
      router.push(target)
      router.refresh()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Create Account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Join FixMate as a customer or technician.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Full Name</label>
          <input className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" {...register("name")} />
          {errors.name ? <p className="mt-1 text-xs text-destructive">{errors.name.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" {...register("email")} />
          {errors.email ? <p className="mt-1 text-xs text-destructive">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input type="password" className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" {...register("password")} />
          {errors.password ? <p className="mt-1 text-xs text-destructive">{errors.password.message}</p> : null}
          <p className="mt-1 text-xs text-muted-foreground">Min 6 chars, with at least 1 uppercase and 1 lowercase letter.</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Role</label>
          <div className="grid grid-cols-2 gap-2">
            {(["customer", "technician"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setValue("role", r, { shouldValidate: true })}
                className={`rounded-md border p-3 text-left text-sm capitalize transition ${role === r ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
              >
                <span className="font-medium">{r}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{r === "customer" ? "Book and track repairs" : "Offer repair services"}</span>
              </button>
            ))}
          </div>
          {errors.role ? <p className="mt-1 text-xs text-destructive">{errors.role.message as string}</p> : null}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account? <Link href={redirect ? `/sign-in?redirect=${encodeURIComponent(redirect)}` : "/sign-in"} className="text-primary hover:underline">Sign In</Link>
      </p>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md rounded-xl border bg-card p-6">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  )
}
