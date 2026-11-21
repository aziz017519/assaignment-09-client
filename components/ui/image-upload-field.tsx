"use client"

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from "react"
import { CheckCircle2, Image as ImageIcon, LoaderCircle, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { buttonVariants } from "@/components/ui/button"
import {
  IMAGE_INPUT_ACCEPT,
  uploadImageToImgbb,
  validateImageFile,
} from "@/lib/imgbb"
import { cn } from "@/lib/utils"

type UploadStatus = "idle" | "uploading" | "success" | "error"

export type ImageUploadFieldProps = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  label?: string
  error?: string
  disabled?: boolean
  onUploadingChange?: (uploading: boolean) => void
  className?: string
}

export function ImageUploadField({
  value,
  onChange,
  onBlur,
  label = "Image URL",
  error,
  disabled = false,
  onUploadingChange,
  className,
}: ImageUploadFieldProps) {
  const uid = useId()
  const fileInputId = `${uid}-file`
  const urlInputId = `${uid}-url`
  const hintId = `${uid}-hint`
  const errorId = `${uid}-error`

  const [file, setFile] = useState<File | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<UploadStatus>("idle")
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewFailed, setPreviewFailed] = useState(false)
  const [inputKey, setInputKey] = useState(0)

  const objectUrlRef = useRef<string | null>(null)
  const mountedRef = useRef(true)

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setObjectUrl(null)
  }, [])

  const resetSelection = useCallback(
    (clearError = true) => {
      releaseObjectUrl()
      setFile(null)
      setStatus("idle")
      setPreviewFailed(false)
      if (clearError) setUploadError(null)
      setInputKey((key) => key + 1)
    },
    [releaseObjectUrl]
  )

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  const upload = useCallback(
    async (fileToUpload: File) => {
      setStatus("uploading")
      setUploadError(null)
      onUploadingChange?.(true)
      try {
        const uploadedUrl = await uploadImageToImgbb(fileToUpload)
        setStatus("success")
        onChange(uploadedUrl)
      } catch (uploadFailure) {
        const message =
          uploadFailure instanceof Error
            ? uploadFailure.message
            : "Image upload failed"
        setUploadError(message)
        setStatus("error")
        setPreviewFailed(false)
        if (mountedRef.current) toast.error(message)
      } finally {
        if (mountedRef.current) onUploadingChange?.(false)
      }
    },
    [onChange, onUploadingChange]
  )

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null
    setInputKey((key) => key + 1)
    if (!selected) return

    const validationError = validateImageFile(selected)
    if (validationError) {
      resetSelection(false)
      setUploadError(validationError)
      setStatus("error")
      toast.error(validationError)
      return
    }

    releaseObjectUrl()
    const nextObjectUrl = URL.createObjectURL(selected)
    objectUrlRef.current = nextObjectUrl
    setObjectUrl(nextObjectUrl)
    setFile(selected)
    setPreviewFailed(false)
    void upload(selected)
  }

  function handleUrlChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value
    resetSelection()
    onChange(nextValue)
  }

  function handleRemove() {
    resetSelection()
    onChange("")
  }

  function handleRetry() {
    if (!file) return
    setPreviewFailed(false)
    void upload(file)
  }

  const previewSrc =
    status === "uploading" || status === "success"
      ? objectUrl ?? (value || null)
      : value || null

  const showSpinner = status === "uploading"
  const showInlineError = Boolean(uploadError || error)
  const showRemove = Boolean(previewSrc) && !showSpinner

  return (
    <div
      className={cn("space-y-3", className)}
      aria-busy={showSpinner || undefined}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg border bg-muted sm:w-40">
          {previewSrc && !previewFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt="Image preview"
              className="h-full w-full object-cover"
              onError={() => setPreviewFailed(true)}
            />
          ) : (
            <div
              role="img"
              aria-label={previewFailed ? "Invalid image URL" : "No image selected"}
              className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center text-xs text-muted-foreground"
            >
              <ImageIcon className="size-6 opacity-60" aria-hidden="true" />
              <span>{previewFailed ? "Invalid image URL" : "No image selected"}</span>
            </div>
          )}

          {showSpinner ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55">
              <LoaderCircle
                className="size-6 animate-spin text-accent"
                aria-label="Uploading image"
              />
            </div>
          ) : null}

          {showRemove ? (
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              aria-label="Remove image"
              className="absolute right-1.5 top-1.5 inline-flex size-7 items-center justify-center rounded-md border border-white/20 bg-black/60 text-white transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor={fileInputId}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-fit cursor-pointer gap-2 focus-within:ring-2 focus-within:ring-ring/50",
                (disabled || showSpinner) && "pointer-events-none opacity-50"
              )}
            >
              <input
                key={inputKey}
                id={fileInputId}
                type="file"
                accept={IMAGE_INPUT_ACCEPT}
                className="sr-only"
                onChange={handleFileChange}
                disabled={disabled || showSpinner}
                aria-describedby={hintId}
              />
              <Upload className="size-4" aria-hidden="true" />
              Choose File
            </label>

            <span id={hintId} className="text-xs text-muted-foreground">
              JPG, PNG or WEBP · Max 4MB
            </span>

            {status === "success" ? (
              <span
                className="inline-flex items-center gap-1 text-xs font-medium text-accent"
                aria-live="polite"
              >
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                Uploaded
              </span>
            ) : null}
          </div>

          {showInlineError ? (
            <div
              id={errorId}
              role="alert"
              aria-live="assertive"
              className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-destructive"
            >
              <span>{uploadError || error}</span>
              {uploadError && file ? (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="font-medium underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  Try again
                </button>
              ) : null}
            </div>
          ) : null}

          <label htmlFor={urlInputId} className="text-sm font-medium">
            {label}
          </label>
          <input
            id={urlInputId}
            type="text"
            inputMode="url"
            placeholder="https://…"
            value={value}
            onChange={handleUrlChange}
            onBlur={onBlur}
            disabled={disabled || showSpinner}
            aria-invalid={showInlineError || undefined}
            aria-describedby={showInlineError ? errorId : undefined}
            className={cn(
              "w-full rounded-md border bg-background px-3 py-2 text-sm",
              showInlineError && "border-destructive"
            )}
          />
        </div>
      </div>
    </div>
  )
}

export default ImageUploadField
