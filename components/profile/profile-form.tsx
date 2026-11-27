"use client"

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Camera,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { ApiError, api } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { uploadImageToImgbb } from "@/lib/imgbb"
import { cn } from "@/lib/utils"
import {
  normalizePhoneNumber,
  profileSchema,
  type ProfileValues,
} from "@/lib/validators"
import type { Role, User } from "@/types"

const MAX_AVATAR_SIZE = 4 * 1024 * 1024

type ProfileResponse = { data: User }

const roleConfig: Record<
  Role,
  { badge: string; addressLabel: string; addressPlaceholder: string }
> = {
  customer: {
    badge: "CUSTOMER ACCOUNT",
    addressLabel: "Delivery / Physical Address",
    addressPlaceholder: "Road, Area, District",
  },
  admin: {
    badge: "ADMIN ACCOUNT",
    addressLabel: "Office Address",
    addressPlaceholder: "Road, Area, District",
  },
  technician: {
    badge: "TECHNICIAN ACCOUNT",
    addressLabel: "Service Area / Address",
    addressPlaceholder: "Road, Area, District",
  },
}

const emptyValues: ProfileValues = {
  name: "",
  phone: "",
  address: "",
  avatar: "",
}

const fieldClass = cn(
  "flex h-11 w-full rounded-lg border border-input bg-background/60 pl-10 pr-3 text-sm text-foreground shadow-sm outline-none transition-colors",
  "placeholder:text-muted-foreground/70 focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/25",
  "disabled:cursor-not-allowed disabled:bg-muted/60 disabled:text-muted-foreground",
  "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/25"
)

const readonlyFieldClass = cn(
  fieldClass,
  "bg-muted/50 text-muted-foreground read-only:cursor-default read-only:opacity-80"
)

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.message
  if (error instanceof TypeError) return "Network error. Please try again."
  if (error instanceof Error && error.message) return error.message
  return fallback
}

function ProfileField({
  label,
  htmlFor,
  icon: Icon,
  error,
  hint,
  className,
  children,
}: {
  label: string
  htmlFor: string
  icon: LucideIcon
  error?: string
  hint?: string
  className?: string
  children: ReactNode
}) {
  const hintId = hint ? `${htmlFor}-hint` : undefined
  const errorId = error ? `${htmlFor}-error` : undefined
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="block text-xs font-bold text-foreground/90">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        {children}
      </div>
      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl" aria-busy="true" role="status">
      <span className="sr-only">Loading profile...</span>
      <div className="animate-pulse rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="h-7 w-32 rounded bg-muted" />
        <div className="mt-2 h-4 w-64 rounded bg-muted/70" />
        <div className="mt-6 h-px bg-border" />
        <div className="flex items-center gap-5 py-6">
          <div className="h-20 w-20 rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 rounded bg-muted" />
            <div className="h-4 w-64 rounded bg-muted/70" />
            <div className="h-8 w-36 rounded-full bg-muted" />
          </div>
        </div>
        <div className="h-px bg-border" />
        <div className="grid gap-5 py-6 sm:grid-cols-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 w-28 rounded bg-muted/70" />
              <div className="h-11 w-full rounded-lg bg-muted" />
            </div>
          ))}
        </div>
        <div className="h-px bg-border" />
        <div className="flex justify-end pt-6">
          <div className="h-9 w-44 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  )
}

export function ProfileForm() {
  const router = useRouter()
  const { isPending: sessionPending, refetch: refetchSession } =
    authClient.useSession()
  const [profile, setProfile] = useState<User | null>(null)
  const [savedValues, setSavedValues] = useState<ProfileValues>(emptyValues)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [avatarInputKey, setAvatarInputKey] = useState(0)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: emptyValues,
  })

  const values = (useWatch({ control }) ?? emptyValues) as ProfileValues
  const isDirty =
    values.name !== savedValues.name ||
    values.phone !== savedValues.phone ||
    values.address !== savedValues.address ||
    values.avatar !== savedValues.avatar

  const role = profile?.role ?? "customer"
  const config = roleConfig[role] ?? roleConfig.customer
  const busy = saving || avatarUploading

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const response = await api.get<ProfileResponse>("/api/users/profile")
      const user = response.data
      const nextValues: ProfileValues = {
        name: user.name ?? "",
        phone: user.phone ?? "",
        address: user.address ?? "",
        avatar: user.avatar ?? user.image ?? "",
      }
      setProfile(user)
      setSavedValues(nextValues)
      setPreviewUrl(user.avatar ?? user.image ?? null)
      reset(nextValues)
    } catch (error) {
      // 401 responses are handled globally by ApiUnauthorizedHandler.
      if (error instanceof ApiError && error.status === 401) return
      const message = getErrorMessage(error, "Failed to load profile")
      setLoadError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [reset])

  useEffect(() => {
    if (sessionPending) return
    let cancelled = false
    void Promise.resolve().then(() => {
      if (!cancelled) void loadProfile()
    })
    return () => {
      cancelled = true
    }
  }, [sessionPending, loadProfile])

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  async function onAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setAvatarInputKey((key) => key + 1)
    if (!file) return

    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      toast.error("Please choose a JPG or PNG image.")
      return
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("Avatar must be 4MB or smaller.")
      return
    }

    setPreviewUrl(URL.createObjectURL(file))
    setAvatarUploading(true)
    try {
      const avatarUrl = await uploadImageToImgbb(file)
      setValue("avatar", avatarUrl, { shouldDirty: true, shouldValidate: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return
      toast.error(getErrorMessage(error, "Avatar upload failed"))
      setPreviewUrl(savedValues.avatar || null)
      setValue("avatar", savedValues.avatar, { shouldValidate: true })
    } finally {
      setAvatarUploading(false)
    }
  }

  async function onSubmit(values: ProfileValues) {
    if (busy) return
    setSaving(true)
    try {
      const payload = {
        name: values.name.trim(),
        phone: normalizePhoneNumber(values.phone.trim()),
        address: values.address.trim(),
        ...(values.avatar.trim() ? { avatar: values.avatar.trim() } : {}),
      }
      const response = await api.patch<ProfileResponse>(
        "/api/users/profile",
        payload
      )
      const user = response.data
      const nextValues: ProfileValues = {
        name: user.name ?? "",
        phone: user.phone ?? "",
        address: user.address ?? "",
        avatar: user.avatar ?? user.image ?? "",
      }
      setProfile(user)
      setSavedValues(nextValues)
      setPreviewUrl(user.avatar ?? user.image ?? null)
      reset(nextValues)

      try {
        await refetchSession()
      } catch {
        // The session store retries on focus; profile data is already saved.
      }
      router.refresh()
      toast.success("Profile updated successfully")
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return
      toast.error(getErrorMessage(error, "Failed to update profile"))
    } finally {
      setSaving(false)
    }
  }

  if (sessionPending || loading) return <ProfileSkeleton />

  if (loadError) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <p className="text-sm text-destructive">{loadError}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => void loadProfile()}
        >
          Try again
        </Button>
      </div>
    )
  }

  const avatarSource = previewUrl ?? values.avatar ?? null

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-2xl border border-border bg-card shadow-xl shadow-black/10">
        <div className="px-6 py-6 sm:px-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your personal information.
            </p>
          </div>

          <div className="mt-5 border-t border-border" />

          <div className="flex flex-col gap-5 py-6 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-3xl font-bold text-primary ring-4 ring-primary/30 ring-offset-4 ring-offset-card">
                {avatarSource ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarSource}
                    alt={`${values.name || profile?.name || "User"} avatar`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (values.name || "?").slice(0, 1).toUpperCase()
                )}
              </div>
              {avatarUploading ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55">
                  <LoaderCircle
                    className="h-6 w-6 animate-spin text-accent"
                    aria-label="Uploading avatar"
                  />
                </div>
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-xl font-bold text-foreground">
                    {values.name || profile?.name}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-primary/80">
                    {profile?.email}
                  </p>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-success/30 bg-success/15 px-2.5 py-1 text-[10px] font-bold tracking-wider text-success">
                  <Shield className="h-3 w-3" aria-hidden="true" />
                  {config.badge}
                </span>
              </div>

              <div className="mt-4 flex flex-col items-start gap-1.5">
                <label
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "w-fit cursor-pointer gap-2 focus-within:ring-2 focus-within:ring-accent/40",
                    avatarUploading && "pointer-events-none opacity-60"
                  )}
                >
                  <input
                    key={avatarInputKey}
                    id="profile-avatar-input"
                    type="file"
                    accept="image/jpeg,image/png"
                    className="sr-only"
                    onChange={onAvatarChange}
                    disabled={avatarUploading}
                    aria-label="Change avatar"
                  />
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  Change Avatar
                </label>
                <p className="text-xs text-muted-foreground">
                  JPG or PNG. Max 4MB.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border" />

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-5 py-6 sm:grid-cols-2"
            aria-busy={busy}
          >
            <ProfileField
              label="Full Name"
              htmlFor="profile-full-name"
              icon={UserIcon}
              error={errors.name?.message}
            >
              <input
                id="profile-full-name"
                type="text"
                autoComplete="name"
                className={fieldClass}
                aria-invalid={errors.name ? "true" : undefined}
                aria-describedby={errors.name ? "profile-full-name-error" : undefined}
                {...register("name")}
              />
            </ProfileField>

            <ProfileField
              label="Email Address"
              htmlFor="profile-email"
              icon={Mail}
            >
              <input
                id="profile-email"
                type="email"
                value={profile?.email ?? ""}
                readOnly
                className={readonlyFieldClass}
              />
            </ProfileField>

            <ProfileField
              label="Phone Number"
              htmlFor="profile-phone"
              icon={Phone}
              error={errors.phone?.message}
            >
              <input
                id="profile-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+880 1711 000000"
                className={fieldClass}
                aria-invalid={errors.phone ? "true" : undefined}
                aria-describedby={errors.phone ? "profile-phone-error" : undefined}
                {...register("phone")}
              />
            </ProfileField>

            <ProfileField
              label="Avatar Hosted URL"
              htmlFor="profile-avatar-url"
              icon={Camera}
              hint="Hosted automatically via ImgBB upon uploading above."
              error={errors.avatar?.message}
            >
              <input
                id="profile-avatar-url"
                type="url"
                value={values.avatar}
                readOnly
                className={cn(readonlyFieldClass, "text-xs")}
                aria-describedby="profile-avatar-url-hint"
              />
            </ProfileField>

            <ProfileField
              label={config.addressLabel}
              htmlFor="profile-address"
              icon={MapPin}
              error={errors.address?.message}
              className="sm:col-span-2"
            >
              <input
                id="profile-address"
                type="text"
                autoComplete="street-address"
                placeholder={config.addressPlaceholder}
                className={fieldClass}
                aria-invalid={errors.address ? "true" : undefined}
                aria-describedby={errors.address ? "profile-address-error" : undefined}
                {...register("address")}
              />
            </ProfileField>

            <div className="flex justify-end border-t border-border pt-6 sm:col-span-2">
              <Button
                type="submit"
                disabled={busy || !isDirty}
                className="gap-2 bg-accent px-5 text-accent-foreground hover:bg-accent/90 disabled:opacity-40"
              >
                {saving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="h-4 w-4" aria-hidden="true" />
                )}
                {saving ? "Saving..." : "Save Profile Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
