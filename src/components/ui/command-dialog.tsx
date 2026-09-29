"use client"

import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function CommandDialog({
  open,
  onOpenChange,
  icon,
  title,
  description,
  children,
  footer,
  className,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  icon?: IconSvgElement
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "top-auto right-0 bottom-0 left-0 flex max-h-[85svh] w-auto max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-b-none p-0",
          "sm:-translate-x-1/2 sm:-translate-y-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:w-full sm:max-w-lg sm:rounded-b-xl",
          className
        )}
      >
        <header className="sticky top-0 z-10 flex items-start gap-3 border-b bg-card/95 px-5 py-4 backdrop-blur">
          {icon && (
            <span
              aria-hidden
              className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-(--radius-lg) bg-primary/12 text-primary"
            >
              <HugeiconsIcon icon={icon} size={16} />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <DialogTitle className="font-heading font-semibold text-base tracking-tight">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="mt-0.5 text-muted-foreground text-xs leading-relaxed">
                {description}
              </DialogDescription>
            )}
          </div>

          <DialogClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close"
                title="Close"
                className="hidden shrink-0 rounded-(--radius-lg) text-muted-foreground hover:text-foreground sm:inline-flex"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </Button>
            }
          />
        </header>

        <ScrollArea className="min-h-0 flex-1">
          <div className="px-5 py-4">{children}</div>
        </ScrollArea>

        <footer
          className={cn(
            "sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-2 border-t bg-card/95 px-5 py-3 backdrop-blur",
            !footer && "sm:hidden"
          )}
        >
          {footer}
          <DialogClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close"
                title="Close"
                className="shrink-0 rounded-(--radius-lg) text-muted-foreground hover:text-foreground sm:hidden"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </Button>
            }
          />
        </footer>
      </DialogContent>
    </Dialog>
  )
}
