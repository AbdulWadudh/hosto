"use client"

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  buildMonth,
  coversDay,
  type DayState,
  dayLabel,
  monthLabel,
  type Span,
  startOfDay,
} from "@/lib/calendar/month"
import { cn } from "@/lib/utils"

const weekdays = [
  { id: "mon", label: "M" },
  { id: "tue", label: "T" },
  { id: "wed", label: "W" },
  { id: "thu", label: "T" },
  { id: "fri", label: "F" },
  { id: "sat", label: "S" },
  { id: "sun", label: "S" },
]

export type Selection = { from: Date | null; to: Date | null }

export function isSelectable(day: DayState): boolean {
  return !day.occupied && !day.inBuffer && !day.isPast
}

function describe(day: DayState): string {
  const by = day.span?.label ? ` by ${day.span.label}` : ""
  if (day.occupied) {
    return `Booked${by}`
  }
  if (day.pending) {
    return `Requested${by}`
  }
  if (day.isLeavingDay) {
    return `Leaving day${by}`
  }
  if (day.inBuffer) {
    return "Turnover"
  }
  if (day.isPast) {
    return "Past"
  }
  return "Free"
}

export function MonthCalendar({
  spans,
  initialYear,
  initialMonth,
  selection,
  highlight,
  onDayDown,
  onDayEnter,
  onSpanPick,
}: {
  spans: Span[]
  initialYear: number
  initialMonth: number
  selection?: Selection
  highlight?: { checkIn: Date; checkOut: Date } | null
  onDayDown?: (date: Date) => void
  onDayEnter?: (date: Date) => void
  onSpanPick?: (id: string) => void
}) {
  const [cursor, setCursor] = useState({
    year: initialYear,
    month: initialMonth,
  })
  const [today, setToday] = useState<Date | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    setToday(new Date())
  }, [])

  const highlightStart = highlight
    ? startOfDay(highlight.checkIn).getTime()
    : null

  useEffect(() => {
    if (highlightStart === null) {
      return
    }
    const target = new Date(highlightStart)
    setCursor({ year: target.getFullYear(), month: target.getMonth() })
  }, [highlightStart])

  const days = useMemo(
    () => buildMonth(cursor.year, cursor.month, spans, today),
    [cursor, spans, today]
  )

  const shift = (by: number) => {
    const next = new Date(cursor.year, cursor.month + by, 1)
    setCursor({ year: next.getFullYear(), month: next.getMonth() })
  }

  const inRange = (date: Date) => {
    if (!selection?.from) {
      return false
    }
    if (!selection.to || selection.to.getTime() === selection.from.getTime()) {
      return date.getTime() === selection.from.getTime()
    }
    return date >= selection.from && date < selection.to
  }

  const sameDay = (a: Date, b: Date) => a.getTime() === b.getTime()

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-heading font-semibold text-lg tracking-tight">
          {monthLabel(cursor.year, cursor.month)}
        </h3>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Previous month"
            onClick={() => shift(-1)}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Next month"
            onClick={() => shift(1)}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </Button>
        </div>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-1">
        {weekdays.map((weekday) => (
          <span
            key={weekday.id}
            className="text-center font-mono text-[0.6rem] text-muted-foreground"
          >
            {weekday.label}
          </span>
        ))}
      </div>

      <motion.div
        key={`${cursor.year}-${cursor.month}`}
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="grid select-none grid-cols-7 gap-1"
      >
        {days.map((day) => {
          const label = describe(day)
          const picked = inRange(day.date)
          const isCheckout =
            selection?.to != null &&
            selection.to.getTime() !== selection.from?.getTime() &&
            sameDay(day.date, selection.to)
          const canPick = Boolean(onDayDown) && isSelectable(day)
          const spanId = day.span?.id ?? null
          const canInspect = Boolean(onSpanPick) && !canPick && spanId !== null
          const highlighted = Boolean(
            highlight && coversDay(highlight, day.date)
          )
          const title = `${dayLabel(day.date)} - ${label}`

          const surface = cn(
            "relative aspect-square w-full overflow-hidden rounded-(--radius-sm) border text-[0.65rem] transition-colors",
            day.inMonth && "border-border/60",
            !day.inMonth &&
              (canPick
                ? "border-border/30 opacity-70"
                : "border-transparent opacity-35"),
            picked && "bg-primary text-primary-foreground ring-2 ring-primary",
            isCheckout && "ring-2 ring-primary ring-offset-1 ring-offset-card",
            !picked && day.occupied && "bg-primary text-primary-foreground",
            !picked &&
              !day.occupied &&
              !day.isLeavingDay &&
              day.inBuffer &&
              "bg-muted-foreground/30",
            !picked &&
              !day.occupied &&
              !day.inBuffer &&
              day.pending &&
              "border-primary/40 border-dashed bg-primary/10",
            !picked &&
              !day.occupied &&
              day.isLeavingDay &&
              (day.span?.status === "PENDING"
                ? "border-primary/40 border-dashed bg-primary/5"
                : "bg-primary/35"),
            !picked &&
              !day.occupied &&
              !day.inBuffer &&
              day.isPast &&
              "bg-[repeating-linear-gradient(135deg,var(--color-muted)_0_3px,transparent_3px_6px)]",
            !picked &&
              !day.occupied &&
              !day.inBuffer &&
              !day.pending &&
              !day.isPast &&
              "bg-background",
            canPick && !picked && "hover:border-primary hover:bg-primary/15",
            canInspect && "cursor-pointer hover:brightness-125",
            highlighted &&
              "z-10 ring-2 ring-foreground/70 ring-offset-1 ring-offset-card"
          )

          const number = (
            <span
              className={cn(
                "absolute top-0.5 left-1 font-mono",
                day.isToday && "underline underline-offset-2",
                day.isPast && !day.occupied && !day.inBuffer && "opacity-40",
                day.occupied || picked
                  ? "text-primary-foreground"
                  : isCheckout
                    ? "text-primary"
                    : "text-muted-foreground"
              )}
            >
              {day.day}
            </span>
          )

          const name = day.span?.label &&
            (day.occupied || day.pending || day.isLeavingDay) && (
              <span
                className={cn(
                  "absolute inset-x-0.5 bottom-0.5 truncate text-center text-[0.5rem] leading-tight",
                  day.occupied || picked
                    ? "text-primary-foreground/90"
                    : "text-muted-foreground"
                )}
              >
                {day.span.label}
              </span>
            )

          if (!canPick) {
            if (!canInspect) {
              return (
                <div key={day.key} title={title} className={surface}>
                  {number}
                  {name}
                </div>
              )
            }
            return (
              <button
                key={day.key}
                type="button"
                title={title}
                aria-label={`${dayLabel(day.date)}, ${label}`}
                onClick={() => spanId && onSpanPick?.(spanId)}
                className={surface}
              >
                {number}
                {name}
              </button>
            )
          }

          return (
            <button
              key={day.key}
              type="button"
              title={title}
              aria-label={`${dayLabel(day.date)}, ${label}`}
              aria-pressed={picked}
              onPointerDown={() => onDayDown?.(day.date)}
              onPointerEnter={() => onDayEnter?.(day.date)}
              onClick={(event) => {
                if (event.detail === 0) {
                  onDayDown?.(day.date)
                }
              }}
              className={surface}
            >
              {number}
              {name}
              {isCheckout && (
                <span className="absolute right-0.5 bottom-0.5 font-mono text-[0.5rem] text-primary uppercase">
                  out
                </span>
              )}
            </button>
          )
        })}
      </motion.div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[0.6rem] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[3px] border border-border bg-background" />
          Free
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" />
          Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary/35" />
          Leaving
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/40" />
          Turnover
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full border border-primary/40 border-dashed bg-primary/10" />
          Requested
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[3px] bg-[repeating-linear-gradient(135deg,var(--color-muted-foreground)_0_2px,transparent_2px_4px)]" />
          Past
        </span>
      </div>
    </div>
  )
}
