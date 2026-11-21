"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ImageUploadField } from "@/components/ui/image-upload-field"
import { ApiError, api } from "@/lib/api"
import { dispatchTechnicianDataChanged } from "@/lib/technician-events"
import { useSubscription } from "@/hooks/use-subscription"

const serviceSchema = z.object({
  title: z.string().trim().min(3, "Enter at least 3 characters"),
  category: z.enum(["Smartphone", "Laptop & PC", "AC", "Refrigerator", "TV", "Washing Machine", "Electrical"]),
  description: z.string().trim().min(10, "Enter at least 10 characters"),
  image: z
    .string()
    .trim()
    .url("Enter a valid image URL")
    .refine((value) => /^https?:\/\//i.test(value), "Enter a valid image URL"),
  basePrice: z.coerce.number().positive("Enter a price greater than 0"),
  estimatedDuration: z.string().trim().min(1, "Enter an estimated duration"),
  serviceMode: z.enum(["Home Visit", "Shop Drop-off"]),
  serviceArea: z.string().trim().min(2, "Enter a service area"),
})

type ServiceValues = z.infer<typeof serviceSchema>

const fieldClass = "w-full rounded-md border bg-background px-3 py-2 text-sm"

function errorCode(error: unknown) {
  if (error instanceof ApiError && error.data && typeof error.data === "object" && "code" in error.data) {
    return String((error.data as { code?: unknown }).code ?? "")
  }
  return ""
}

export default function AddServicePage() {
  const router = useRouter()
  const { status } = useSubscription()
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const atLimit = status?.serviceLimit != null && status.serviceCount >= status.serviceLimit

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ServiceValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: "",
      category: "Smartphone",
      description: "",
      image: "",
      basePrice: 0,
      estimatedDuration: "",
      serviceMode: "Home Visit",
      serviceArea: "",
    },
  })

  async function onSubmit(values: ServiceValues) {
    if (imageUploading) return
    setSaving(true)
    try {
      await api.post("/api/services", values)
      dispatchTechnicianDataChanged()
      toast.success("Service submitted for approval")
      router.push("/dashboard/technician/my-services")
    } catch (error) {
      if (errorCode(error) === "PLAN_LIMIT_REACHED") {
        toast.error("Free plan limit reached — upgrade to Pro to add more services.")
      } else {
        toast.error(error instanceof Error ? error.message : "Could not create service")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Service</h1>
        <p className="text-muted-foreground">New services are submitted for admin approval before appearing publicly.</p>
      </div>

      {atLimit ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          <span>You have reached the Free plan limit (3 services). Upgrade to Pro for unlimited listings.</span>
          <Button variant="outline" size="sm" asChild><Link href="/dashboard/technician/subscription">View plans</Link></Button>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input className={fieldClass} {...register("title")} />
            {errors.title ? <p className="mt-1 text-xs text-destructive">{errors.title.message}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select className={fieldClass} {...register("category")}>
              <option>Smartphone</option>
              <option>Laptop &amp; PC</option>
              <option>AC</option>
              <option>Refrigerator</option>
              <option>TV</option>
              <option>Washing Machine</option>
              <option>Electrical</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Base price (USD)</label>
            <input type="number" min="1" step="1" className={fieldClass} {...register("basePrice")} />
            {errors.basePrice ? <p className="mt-1 text-xs text-destructive">{errors.basePrice.message}</p> : null}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea rows={4} className={fieldClass} {...register("description")} />
            {errors.description ? <p className="mt-1 text-xs text-destructive">{errors.description.message}</p> : null}
          </div>
          <div className="sm:col-span-2">
            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <ImageUploadField
                  label="Image URL"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.image?.message}
                  disabled={saving || atLimit}
                  onUploadingChange={setImageUploading}
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Estimated duration</label>
            <input className={fieldClass} placeholder="2 hours" {...register("estimatedDuration")} />
            {errors.estimatedDuration ? <p className="mt-1 text-xs text-destructive">{errors.estimatedDuration.message}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Service area</label>
            <input className={fieldClass} {...register("serviceArea")} />
            {errors.serviceArea ? <p className="mt-1 text-xs text-destructive">{errors.serviceArea.message}</p> : null}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Service mode</label>
            <select className={fieldClass} {...register("serviceMode")}>
              <option>Home Visit</option>
              <option>Shop Drop-off</option>
            </select>
          </div>
        </div>
        <Button type="submit" disabled={saving || atLimit || imageUploading}>
          {saving ? "Submitting…" : "Submit service"}
        </Button>
      </form>
    </div>
  )
}
