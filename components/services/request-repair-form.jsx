"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

const inputClass = "w-full rounded-md border bg-background px-3 py-2 text-sm"
const errorTextClass = "mt-1 text-sm text-destructive"

function todayInputValue() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function validate(values) {
  const errors = {}
  const phone = values.phone.trim()
  const address = values.address.trim()
  const description = values.description.trim()

  if (!/^[0-9+\-()\s]{7,20}$/.test(phone)) {
    errors.phone = "Provide a valid phone number (7-20 characters)."
  }
  if (address.length < 10 || address.length > 300) {
    errors.address = "Address must be at least 10 characters (maximum 300)."
  }
  if (!values.preferredDate) {
    errors.preferredDate = "Choose a preferred date."
  } else if (values.preferredDate < todayInputValue()) {
    errors.preferredDate = "Preferred date must be today or in the future."
  }
  if (description.length < 10 || description.length > 2000) {
    errors.description = "Problem description must be at least 10 characters (maximum 2000)."
  }
  return errors
}

export function RequestRepairForm({ serviceId }) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [preferredDate, setPreferredDate] = useState("")
  const [description, setDescription] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    // Defer state updates out of the effect body to avoid cascading renders.
    void Promise.resolve().then(() => {
      if (active) setPhone((current) => current || session?.user?.phone || "")
    })
    return () => {
      active = false
    }
  }, [session?.user?.phone])

  function changeField(setter, key, value) {
    setter(value)
    setFieldErrors((current) => (current[key] ? { ...current, [key]: undefined } : current))
  }

  async function onSubmit(event) {
    event.preventDefault()
    setFormError(null)

    const errors = validate({ phone, address, preferredDate, description })
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      await api.post("/api/bookings", {
        serviceId,
        customerPhone: phone.trim(),
        address: address.trim(),
        preferredDate,
        problemDescription: description.trim(),
      })
      toast.success("Repair request sent")
      router.push("/dashboard/customer/bookings")
    } catch (err) {
      setFormError(err instanceof Error && err.message ? err.message : "Could not send the repair request.")
    } finally {
      setSubmitting(false)
    }
  }

  if (isPending) {
    return <div className="mt-6 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Checking your session...</div>
  }

  if (!session) {
    return (
      <div className="mt-6 rounded-xl border border-dashed p-4">
        <h2 className="font-semibold">Request Repair</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sign in as a customer to send a repair request for this service.</p>
        <div className="mt-4">
          <Button asChild>
            <Link href={`/sign-in?redirect=/services/${serviceId}`}>Sign in to Request</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (session.user?.role !== "customer") {
    return (
      <div className="mt-6 rounded-xl border border-dashed p-4">
        <h2 className="font-semibold">Request Repair</h2>
        <p className="mt-1 text-sm text-muted-foreground">Only customer accounts can request repairs.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4 rounded-xl border bg-card p-4">
      <div>
        <h2 className="font-semibold">Request Repair</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tell the technician what needs fixing and when you are available.</p>
      </div>

      <div>
        <label htmlFor="customerPhone" className="mb-1 block text-sm font-medium">Phone</label>
        <input
          id="customerPhone"
          name="customerPhone"
          autoComplete="tel"
          className={inputClass}
          inputMode="tel"
          value={phone}
          onChange={(event) => changeField(setPhone, "phone", event.target.value)}
          placeholder="01XXXXXXXXX"
          aria-invalid={!!fieldErrors.phone}
          aria-describedby={fieldErrors.phone ? "customerPhone-error" : undefined}
          required
        />
        {fieldErrors.phone ? <p id="customerPhone-error" role="alert" className={errorTextClass}>{fieldErrors.phone}</p> : null}
      </div>

      <div>
        <label htmlFor="address" className="mb-1 block text-sm font-medium">Address</label>
        <input
          id="address"
          name="address"
          autoComplete="street-address"
          className={inputClass}
          value={address}
          onChange={(event) => changeField(setAddress, "address", event.target.value)}
          placeholder="House, street, area (at least 10 characters)"
          minLength={10}
          maxLength={300}
          aria-invalid={!!fieldErrors.address}
          aria-describedby={fieldErrors.address ? "address-error" : undefined}
          required
        />
        {fieldErrors.address ? <p id="address-error" role="alert" className={errorTextClass}>{fieldErrors.address}</p> : null}
      </div>

      <div>
        <label htmlFor="preferredDate" className="mb-1 block text-sm font-medium">Preferred date</label>
        <input
          id="preferredDate"
          name="preferredDate"
          autoComplete="off"
          type="date"
          className={inputClass}
          value={preferredDate}
          min={todayInputValue()}
          onChange={(event) => changeField(setPreferredDate, "preferredDate", event.target.value)}
          aria-invalid={!!fieldErrors.preferredDate}
          aria-describedby={fieldErrors.preferredDate ? "preferredDate-error" : undefined}
          required
        />
        {fieldErrors.preferredDate ? <p id="preferredDate-error" role="alert" className={errorTextClass}>{fieldErrors.preferredDate}</p> : null}
      </div>

      <div>
        <label htmlFor="problemDescription" className="mb-1 block text-sm font-medium">Problem description</label>
        <textarea
          id="problemDescription"
          name="problemDescription"
          autoComplete="off"
          className={inputClass}
          rows={4}
          value={description}
          onChange={(event) => changeField(setDescription, "description", event.target.value)}
          placeholder="Describe the issue in at least 10 characters"
          minLength={10}
          maxLength={2000}
          aria-invalid={!!fieldErrors.description}
          aria-describedby={fieldErrors.description ? "problemDescription-error" : undefined}
          required
        />
        {fieldErrors.description ? <p id="problemDescription-error" role="alert" className={errorTextClass}>{fieldErrors.description}</p> : null}
      </div>

      {formError ? (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Sending..." : "Send Repair Request"}
      </Button>
    </form>
  )
}
