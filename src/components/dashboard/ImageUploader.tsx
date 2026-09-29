"use client"

import { CloudUploadIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AnimatePresence } from "motion/react"
import { useRef, useState } from "react"
import {
  ImageThumbnail,
  type Upload,
} from "@/components/dashboard/ImageThumbnail"
import { cn } from "@/lib/utils"

const maxBytes = 8 * 1024 * 1024
const accepted = "image/jpeg,image/png,image/webp,image/avif"

function putWithProgress(
  uploadUrl: string,
  file: File,
  onProgress: (fraction: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open("PUT", uploadUrl)
    request.setRequestHeader("Content-Type", file.type)
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(event.loaded / event.total)
      }
    })
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        resolve()
        return
      }
      reject(new Error(`Storage refused the file (${request.status}).`))
    })
    request.addEventListener("error", () => {
      reject(new Error("The upload connection failed."))
    })
    request.send(file)
  })
}

export function ImageUploader({ name = "imageUrls" }: { name?: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploads, setUploads] = useState<Upload[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const update = (id: string, patch: Partial<Upload>) => {
    setUploads((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
  }

  const send = async (file: File) => {
    const id = crypto.randomUUID()
    const preview = URL.createObjectURL(file)

    setUploads((current) => [
      ...current,
      { id, name: file.name, preview, progress: 0, url: null, error: null },
    ])

    if (file.size > maxBytes) {
      update(id, { error: "Larger than 8 MB." })
      return
    }

    try {
      const response = await fetch("/api/v1/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: null }))
        throw new Error(payload.error ?? "Could not prepare the upload.")
      }

      const { uploadUrl, publicUrl } = await response.json()
      await putWithProgress(uploadUrl, file, (fraction) => {
        update(id, { progress: fraction })
      })
      update(id, { progress: 1, url: publicUrl })
    } catch (failure) {
      update(id, {
        error: failure instanceof Error ? failure.message : "Upload failed.",
      })
    }
  }

  const accept = (files: FileList | null) => {
    if (!files) {
      return
    }
    for (const file of Array.from(files)) {
      void send(file)
    }
  }

  const move = (from: number, to: number) => {
    setUploads((current) => {
      if (to < 0 || to >= current.length || from === to) {
        return current
      }
      const next = [...current]
      const [lifted] = next.splice(from, 1)
      next.splice(to, 0, lifted)
      return next
    })
  }

  const remove = (id: string) => {
    setUploads((current) => {
      const target = current.find((item) => item.id === id)
      if (target) {
        URL.revokeObjectURL(target.preview)
      }
      return current.filter((item) => item.id !== id)
    })
  }

  return (
    <div className="space-y-3">
      {uploads.map((upload) =>
        upload.url ? (
          <input key={upload.id} type="hidden" name={name} value={upload.url} />
        ) : null
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          accept(event.dataTransfer.files)
        }}
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-(--radius-2xl) border border-dashed px-6 py-10 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/10"
            : "bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
        )}
      >
        <HugeiconsIcon
          icon={CloudUploadIcon}
          size={22}
          className="text-primary"
        />
        <span className="font-medium text-sm">
          Drop photographs here, or choose files
        </span>
        <span className="text-muted-foreground text-xs">
          JPEG, PNG, WebP or AVIF, up to 8 MB each. Drag a thumbnail to reorder;
          the first one is the cover.
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accepted}
        multiple
        tabIndex={-1}
        aria-hidden
        className="hidden"
        onChange={(event) => {
          accept(event.target.files)
          event.target.value = ""
        }}
      />

      {uploads.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <AnimatePresence initial={false}>
            {uploads.map((upload, index) => (
              <ImageThumbnail
                key={upload.id}
                upload={upload}
                index={index}
                total={uploads.length}
                onMove={move}
                onRemove={remove}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}
