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
import { buildWeekRibbons } from "@/lib/calendar/ribbons"
import { cn } from "@/lib/utils"

const weekdays = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
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
  const [isDragging, setIsDragging] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    setToday(new Date())
  }, [])

  useEffect(() => {
    const stop = () => setIsDragging(false)
    window.addEventListener("pointerup", stop)
    window.addEventListener("pointercancel", stop)
    return () => {
      window.removeEventListener("pointerup", stop)
      window.removeEventListener("pointercancel", stop)
    }
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

  const weeks = useMemo(() => {
    const days = buildMonth(cursor.year, cursor.month, spans, today)
    return Array.from({ length: 6 }, (_, index) => {
      const week = days.slice(index * 7, index * 7 + 7)
      return { week, ribbons: buildWeekRibbons(week, spans) }
    })
  }, [cursor, spans, today])

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
        className="select-none space-y-1"
      >
        {weeks.map(({ week, ribbons }) => (
          <div key={week[0]?.key} className="relative grid grid-cols-7 gap-1">
            {week.map((day) => {
              const label = describe(day)
              const picked = inRange(day.date)
              const canPick = Boolean(onDayDown) && isSelectable(day)
              const taken = day.span !== null
              const highlighted = Boolean(
                highlight && coversDay(highlight, day.date)
              )

              const surface = cn(
                "relative aspect-square w-full rounded-(--radius-sm) border text-[0.65rem] transition-colors",
                day.inMonth ? "border-border/60" : "border-border/25",
                !day.inMonth && "opacity-60",
                picked && "border-primary bg-primary/25",
                !picked &&
                  taken &&
                  (day.span?.status === "PENDING"
                    ? "bg-amber-400/10"
                    : "bg-primary/10"),
                !picked && !taken && day.inBuffer && "bg-muted-foreground/25",
                !picked &&
                  !taken &&
                  !day.inBuffer &&
                  day.isPast &&
                  "bg-[repeating-linear-gradient(135deg,var(--color-muted)_0_3px,transparent_3px_6px)]",
                canPick &&
                  !picked &&
                  "hover:border-primary hover:bg-primary/15",
                highlighted &&
                  "z-10 ring-2 ring-foreground/70 ring-offset-1 ring-offset-card"
              )

              const number = (
                <span
                  className={cn(
                    "absolute top-0.5 left-1 font-mono",
                    day.isToday && "underline underline-offset-2",
                    day.isPast && !taken && "opacity-40",
                    picked ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {day.day}
                </span>
              )

              if (!canPick) {
                return (
                  <div
                    key={day.key}
                    title={`${dayLabel(day.date)} - ${label}`}
                    className={surface}
                  >
                    {number}
                  </div>
                )
              }

              return (
                <button
                  key={day.key}
                  type="button"
                  title={`${dayLabel(day.date)} - ${label}`}
                  aria-label={`${dayLabel(day.date)}, ${label}`}
                  aria-pressed={picked}
                  onPointerDown={() => {
                    setIsDragging(true)
                    onDayDown?.(day.date)
                  }}
                  onPointerEnter={() => onDayEnter?.(day.date)}
                  onClick={(event) => {
                    if (event.detail === 0) {
                      onDayDown?.(day.date)
                    }
                  }}
                  className={surface}
                >
                  {number}
                </button>
              )
            })}

            <div className="pointer-events-none absolute inset-0 grid grid-cols-7 items-end gap-1">
              {ribbons.map((ribbon) => {
                const waiting = ribbon.span.status === "PENDING"
                return (
                  <button
                    key={ribbon.key}
                    type="button"
                    disabled={!onSpanPick}
                    title={ribbon.span.label ?? "Reserved"}
                    onClick={() => onSpanPick?.(ribbon.span.id)}
                    style={{
                      gridColumnStart: ribbon.startColumn,
                      gridColumnEnd: ribbon.endColumn,
                      marginBottom: `${0.25 + ribbon.lane * 1.1}rem`,
                    }}
                    className={cn(
                      "mx-0.5 flex h-4 min-w-0 items-center px-1.5 text-[0.55rem] leading-none transition-[filter]",
                      isDragging
                        ? "pointer-events-none"
                        : "pointer-events-auto",
                      onSpanPick && "cursor-pointer hover:brightness-110",
                      waiting
                        ? "border border-amber-400/70 border-dashed bg-amber-400/25 text-amber-100"
                        : "bg-primary text-primary-foreground",
                      ribbon.clippedStart
                        ? "-ml-1 rounded-l-none"
                        : "rounded-l-(--radius-2xl)",
                      ribbon.clippedEnd
                        ? "-mr-1 rounded-r-none"
                        : "rounded-r-(--radius-2xl)"
                    )}
                  >
                    <span className="truncate">
                      {ribbon.clippedStart
                        ? "..."
                        : (ribbon.span.label ?? "Reserved")}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </motion.div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[0.6rem] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[3px] border border-border bg-background" />
          Free
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-(--radius-2xl) bg-primary" />
          Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-(--radius-2xl) border border-amber-400/70 border-dashed bg-amber-400/25" />
          Requested
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[3px] bg-muted-foreground/40" />
          Turnover
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[3px] bg-[repeating-linear-gradient(135deg,var(--color-muted-foreground)_0_2px,transparent_2px_4px)]" />
          Past
        </span>
      </div>
    </div>
  )
}
