"use client"

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  buildMonth,
  type DayState,
  dayLabel,
  monthLabel,
  type Span,
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
  if (day.occupied) {
    return "Booked"
  }
  if (day.inBuffer) {
    return "Turnover"
  }
  if (day.pending) {
    return "Requested"
  }
  return "Free"
}

export function MonthCalendar({
  spans,
  initialYear,
  initialMonth,
  selection,
  onSelectDay,
}: {
  spans: Span[]
  initialYear: number
  initialMonth: number
  selection?: Selection
  onSelectDay?: (date: Date) => void
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
    const end = selection.to ?? selection.from
    return date >= selection.from && date <= end
  }

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
        className="grid grid-cols-7 gap-1"
      >
        {days.map((day) => {
          const split = day.isDeparture && day.inBuffer
          const label = describe(day)
          const picked = inRange(day.date)
          const canPick =
            Boolean(onSelectDay) && isSelectable(day) && day.inMonth
          const title = `${dayLabel(day.date)} - ${label}`

          const surface = cn(
            "relative aspect-square w-full overflow-hidden rounded-(--radius-sm) border text-[0.65rem] transition-colors",
            day.inMonth ? "border-border/60" : "border-transparent opacity-35",
            picked &&
              "bg-primary/85 text-primary-foreground ring-2 ring-primary",
            !picked &&
              day.occupied &&
              !split &&
              "bg-primary text-primary-foreground",
            !picked &&
              !day.occupied &&
              day.inBuffer &&
              !split &&
              "bg-muted-foreground/30",
            !picked &&
              !day.occupied &&
              !day.inBuffer &&
              day.pending &&
              "border-primary/40 border-dashed bg-primary/10",
            !picked &&
              !day.occupied &&
              !day.inBuffer &&
              !day.pending &&
              "bg-muted/25",
            canPick && !picked && "hover:border-primary hover:bg-primary/15"
          )

          const number = (
            <span
              className={cn(
                "absolute top-0.5 left-1 font-mono",
                day.isToday && "underline underline-offset-2",
                day.occupied || split || picked
                  ? "text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              {day.day}
            </span>
          )

          const splitOverlay = split && (
            <span className="absolute inset-0 bg-[linear-gradient(135deg,var(--color-primary)_0_49.4%,transparent_49.4%_50.6%,var(--color-muted-foreground)_50.6%_100%)] opacity-90" />
          )

          if (!canPick) {
            return (
              <div key={day.key} title={title} className={surface}>
                {splitOverlay}
                {number}
              </div>
            )
          }

          return (
            <button
              key={day.key}
              type="button"
              title={title}
              aria-label={`${dayLabel(day.date)}, ${label}`}
              aria-pressed={picked}
              onClick={() => onSelectDay?.(day.date)}
              className={surface}
            >
              {splitOverlay}
              {number}
            </button>
          )
        })}
      </motion.div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[0.6rem] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" />
          Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/40" />
          Turnover
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full border border-primary/40 border-dashed bg-primary/10" />
          Requested
        </span>
      </div>
    </div>
  )
}
