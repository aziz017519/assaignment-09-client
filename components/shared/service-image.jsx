"use client"

import Image from "next/image"
import { Wrench } from "lucide-react"
import { useState } from "react"

// Keep in sync with images.remotePatterns in next.config.ts.
const ALLOWED_IMAGE_HOSTS = new Set([
  "i.ibb.co",
  "lh3.googleusercontent.com",
  "avatars.githubusercontent.com",
  "images.unsplash.com",
])

function cleanSrc(src) {
  return typeof src === "string" && src.trim() ? src.trim() : null
}

function needsUnoptimized(src) {
  if (src.startsWith("data:") || src.startsWith("blob:")) return true
  if (!/^https?:\/\//i.test(src)) return false
  try {
    return !ALLOWED_IMAGE_HOSTS.has(new URL(src).hostname.toLowerCase())
  } catch {
    return true
  }
}

/**
 * Image wrapper that never renders next/image for empty/broken sources.
 * Unknown remote hosts and data URLs bypass the optimizer; known hosts keep
 * normal optimization and still fall back to an icon if the upstream 404s.
 */
export function ServiceImage({
  src,
  alt = "",
  fill = false,
  width,
  height,
  sizes,
  className = "",
  priority = false,
}) {
  const [failedSrc, setFailedSrc] = useState(null)
  const imageSrc = cleanSrc(src)
  const failed = imageSrc !== null && failedSrc === imageSrc

  if (!imageSrc || failed) {
    return (
      <div
        role="img"
        aria-label={alt || "Image unavailable"}
        className={
          fill
            ? `absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground ${className}`
            : `flex h-full w-full items-center justify-center bg-muted text-muted-foreground ${className}`
        }
      >
        <Wrench className="size-8 opacity-60" aria-hidden="true" />
      </div>
    )
  }

  const imageProps = {
    src: imageSrc,
    alt,
    sizes,
    className,
    priority,
    unoptimized: needsUnoptimized(imageSrc),
    onError: () => setFailedSrc(imageSrc),
    ...(fill ? { fill: true } : { width, height }),
  }

  return <Image {...imageProps} alt={alt || "Service image"} />
}

export default ServiceImage
