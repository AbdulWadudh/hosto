"use client"

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  ImageNotFound01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type Upload = {
  id: string
  name: string
  preview: string
  progress: number
  url: string | null
  error: string | null
}

type ImageThumbnailProps = {
  upload: Upload
  index: number
  total: number
  onMove: (from: number, to: number) => void
  onRemove: (id: string) => void
}

export function ImageThumbnail({
  upload,
  index,
  total,
  onMove,
  onRemove,
}: ImageThumbnailProps) {
  const reduced = useReducedMotion()

  return (
    <motion.li
      layout={!reduced}
      initial={reduced ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: drag is a pointer-only
          enhancement; the Move earlier and Move later buttons below are the
          keyboard and screen reader path to the same reordering. */}
      <div
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData("text/plain", String(index))
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          const from = Number(event.dataTransfer.getData("text/plain"))
          if (Number.isInteger(from)) {
            onMove(from, index)
          }
        }}
        className="group relative aspect-4/3 cursor-grab overflow-hidden rounded-(--radius-xl) border bg-muted active:cursor-grabbing"
      >
        {upload.error ? (
          <span className="flex size-full flex-col items-center justify-center gap-1.5 p-3 text-center">
            <HugeiconsIcon
              icon={ImageNotFound01Icon}
              size={18}
              className="text-destructive"
            />
            <span className="text-[0.7rem] text-destructive leading-tight">
              {upload.error}
            </span>
          </span>
        ) : (
          // biome-ignore lint/performance/noImgElement: a blob: object URL cannot go through the image optimiser
          <img
            src={upload.preview}
            alt=""
            className={cn(
              "size-full object-cover transition-opacity",
              upload.url ? "opacity-100" : "opacity-60"
            )}
          />
        )}

        {index === 0 && (
          <span className="absolute top-2 left-2 rounded-(--radius-2xl) bg-primary px-2 py-0.5 text-[0.62rem] text-primary-foreground">
            Cover
          </span>
        )}

        {!upload.url && !upload.error && (
          <span className="absolute inset-x-0 bottom-0 h-1 bg-black/25">
            <motion.span
              className="block h-full bg-primary"
              animate={{ width: `${Math.round(upload.progress * 100)}%` }}
              transition={{ ease: "easeOut", duration: 0.25 }}
            />
          </span>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Remove ${upload.name}`}
          title="Remove"
          onClick={() => onRemove(upload.id)}
          className="absolute top-1.5 right-1.5 bg-background/85 opacity-0 backdrop-blur transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={12} />
        </Button>

        <span className="absolute inset-x-1.5 bottom-2 flex justify-between opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Move ${upload.name} earlier`}
            title="Move earlier"
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
            className="bg-background/85 backdrop-blur"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={12} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Move ${upload.name} later`}
            title="Move later"
            disabled={index === total - 1}
            onClick={() => onMove(index, index + 1)}
            className="bg-background/85 backdrop-blur"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
          </Button>
        </span>
      </div>
    </motion.li>
  )
}
