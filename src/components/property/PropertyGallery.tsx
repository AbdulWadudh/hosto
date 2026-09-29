"use client"

import { Image01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, useReducedMotion } from "motion/react"
import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function PropertyGallery({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()

  if (images.length === 0) {
    return (
      <div className="flex aspect-16/9 w-full flex-col items-center justify-center gap-2 rounded-(--radius-3xl) border border-dashed bg-muted/20 text-muted-foreground">
        <HugeiconsIcon icon={Image01Icon} size={22} />
        <p className="text-sm">No photographs yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <motion.div
        key={images[active]}
        initial={reduced ? false : { opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="relative aspect-16/9 w-full overflow-hidden rounded-(--radius-3xl) border bg-muted"
      >
        <Image
          src={images[active]}
          alt={`${title}, photograph ${active + 1} of ${images.length}`}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover"
          priority
        />
      </motion.div>

      {images.length > 1 && (
        <ul className="grid grid-cols-5 gap-2">
          {images.slice(0, 10).map((url, index) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photograph ${index + 1}`}
                aria-current={index === active}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-(--radius-lg) border transition-opacity",
                  index === active
                    ? "border-primary opacity-100"
                    : "opacity-60 hover:opacity-100"
                )}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="12vw"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
