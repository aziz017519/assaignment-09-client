"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { profileSchema, type ProfileValues } from "@/lib/validators"
import { uploadImageToImgbb } from "@/lib/imgbb"
import { api } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import type { User } from "@/types"

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user as Partial<User> | null | undefined
  const [saving, setSaving] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name || "",
      phone: user?.phone || "",
      area: user?.area || "",
      bio: user?.bio || "",
    },
  })

  async function onSubmit(values: ProfileValues) {
    setSaving(true)
    try {
      let imageUrl: string | undefined
      if (photo) imageUrl = await uploadImageToImgbb(photo)
      await api.patch("/api/users/profile", { ...values, ...(imageUrl ? { image: imageUrl } : {}) })
      await authClient.getSession()
      toast.success("Profile updated successfully")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (isPending) return <div className="p-6">Loading profile...</div>

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Update Profile</h1>
        <p className="text-muted-foreground">Manage your personal information. Email and role are read-only.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" {...register("name")} />
            {errors.name ? <p className="mt-1 text-xs text-destructive">{errors.name.message}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email (read-only)</label>
            <input value={user?.email || ""} readOnly className="w-full rounded-md border bg-muted px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Role (read-only)</label>
            <input value={user?.role || "customer"} readOnly className="w-full rounded-md border bg-muted px-3 py-2 text-sm capitalize" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" {...register("phone")} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Area</label>
            <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" {...register("area")} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Bio</label>
            <textarea rows={4} className="w-full rounded-md border bg-background px-3 py-2 text-sm" {...register("bio")} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} className="w-full text-sm" />
            <p className="mt-1 text-xs text-muted-foreground">Upload a new photo to ImgBB.</p>
          </div>
        </div>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
      </form>
    </div>
  )
}
