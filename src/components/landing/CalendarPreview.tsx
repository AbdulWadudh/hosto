"use client"

import { motion, useReducedMotion } from "motion/react"
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
const leadingBlanks = 2
const daysInMonth = 31
const turnaroundDay = 12

const ribbons = [
  { label: "Meera K.", start: 7, span: 5, row: 2, tone: "named" },
  { label: "Reserved", start: 14, span: 4, row: 3, tone: "masked" },
] as const

const columnOf = (day: number) => ((day + leadingBlanks - 1) % 7) + 1

const cells = Array.from(
  { length: leadingBlanks + daysInMonth },
  (_, index) => {
    const day = index - leadingBlanks + 1
    return { id: day > 0 ? `day-${day}` : `blank-${index}`, day }
  }
)

export function CalendarPreview({ className }: { className?: string }) {
  const reduced = useReducedMotion()

  return (
    <div
      className={cn(
        "w-full rounded-(--radius-3xl) border bg-card/95 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl",
        className
      )}
    >
      <div className="mb-4 flex items-baseline justify-between">
        <p className="font-heading font-semibold text-sm tracking-tight">
          October
        </p>
        <p className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-widest">
          4h turnover
        </p>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekdays.map((weekday) => (
          <span
            key={weekday.id}
            className="text-center font-mono text-[0.6rem] text-muted-foreground"
          >
            {weekday.label}
          </span>
        ))}
      </div>

      <div className="relative">
        <div className="grid grid-cols-7 gap-1">
          {cells.map(({ id, day }) => {
            const isTurnaround = day === turnaroundDay

            return (
              <div
                key={id}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-(--radius-sm) border border-transparent",
                  day > 0 && "border-border/60 bg-muted/30"
                )}
              >
                {isTurnaround && (
                  <span className="absolute inset-0 bg-[linear-gradient(135deg,var(--color-muted-foreground)_0_49.4%,transparent_49.4%_50.6%,var(--color-primary)_50.6%_100%)] opacity-55" />
                )}
                {day > 0 && (
                  <span className="absolute top-1 left-1.5 font-mono text-[0.6rem] text-muted-foreground">
                    {day}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <div className="pointer-events-none absolute inset-0 grid grid-cols-7 grid-rows-5 gap-1">
          {ribbons.map((ribbon, index) => (
            <motion.div
              key={ribbon.label}
              initial={reduced ? false : { scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 24,
                delay: 0.35 + index * 0.18,
              }}
              style={{
                gridRow: ribbon.row,
                gridColumn: `${columnOf(ribbon.start)} / span ${ribbon.span}`,
                transformOrigin: "left",
              }}
              className={cn(
                "z-10 mb-1.5 flex h-6 items-center self-end truncate rounded-(--radius-2xl) px-2.5 font-medium text-[0.65rem]",
                ribbon.tone === "named"
                  ? "bg-primary text-primary-foreground"
                  : "border border-primary/35 bg-primary/15 text-foreground"
              )}
            >
              {ribbon.label}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 border-t pt-3 font-mono text-[0.6rem] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" />
          Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary/25" />
          Identity hidden
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rotate-45 bg-muted-foreground/60" />
          Turnaround
        </span>
      </div>
    </div>
  )
}
