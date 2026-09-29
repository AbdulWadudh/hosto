"use client"

import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useActionState, useEffect, useRef, useState } from "react"
import { MonthCalendar, type Selection } from "@/components/calendar"
import { labelForTime, TimeChoice } from "@/components/property/TimeChoice"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { config } from "@/config"
import {
  atTime,
  dayLabel,
  describeDuration,
  nightsBetween,
  rangeHasConflict,
  type Span,
  toDateInput,
} from "@/lib/calendar/month"
import {
  type RequestDatesState,
  requestDates,
} from "@/lib/properties/requestDates"

export function AvailabilityBooking({
  slug,
  spans,
  initialYear,
  initialMonth,
  canBook,
  isOwner,
  highlight,
}: {
  slug: string
  spans: Span[]
  initialYear: number
  initialMonth: number
  canBook: boolean
  isOwner: boolean
  highlight?: { checkIn: Date; checkOut: Date } | null
}) {
  const [selection, setSelection] = useState<Selection>({
    from: null,
    to: null,
  })
  const [notice, setNotice] = useState<string | null>(null)
  const [state, action, isPending] = useActionState<
    RequestDatesState,
    FormData
  >(requestDates, { error: null })
  const reduced = useReducedMotion()

  const dragging = useRef(false)

  useEffect(() => {
    const stop = () => {
      dragging.current = false
    }
    window.addEventListener("pointerup", stop)
    window.addEventListener("pointercancel", stop)
    return () => {
      window.removeEventListener("pointerup", stop)
      window.removeEventListener("pointercancel", stop)
    }
  }, [])

  const settle = (from: Date, to: Date): Selection => {
    if (rangeHasConflict(from, to, spans)) {
      setNotice("Those nights run through dates that are already taken.")
      return { from, to: null }
    }
    return { from, to }
  }

  const beginAt = (date: Date) => {
    dragging.current = true
    setNotice(null)
    setSelection((current) => {
      if (current.from && date > current.from) {
        return settle(current.from, date)
      }
      if (
        current.from &&
        !current.to &&
        date.getTime() === current.from.getTime()
      ) {
        return { from: date, to: date }
      }
      return { from: date, to: null }
    })
  }

  const extendTo = (date: Date) => {
    if (!dragging.current) {
      return
    }
    setSelection((current) => {
      if (!current.from || date <= current.from) {
        return current
      }
      if (rangeHasConflict(current.from, date, spans)) {
        return current
      }
      return { from: current.from, to: date }
    })
  }

  const clear = () => {
    setNotice(null)
    setSelection({ from: null, to: null })
  }

  const nights =
    selection.from && selection.to
      ? nightsBetween(selection.from, selection.to)
      : 0
  const isDayVisit = nights === 0 && selection.to !== null

  const [arrivalTime, setArrivalTime] = useState<string>(config.booking.arrival)
  const [departureTime, setDepartureTime] = useState<string>(
    config.booking.departure
  )

  useEffect(() => {
    setArrivalTime(
      isDayVisit ? config.booking.dayVisit.arrival : config.booking.arrival
    )
    setDepartureTime(
      isDayVisit ? config.booking.dayVisit.departure : config.booking.departure
    )
  }, [isDayVisit])

  const arrivalLabel = labelForTime(
    config.booking.arrivalChoices,
    arrivalTime
  ).toLowerCase()
  const departureLabel = labelForTime(
    config.booking.departureChoices,
    departureTime
  ).toLowerCase()

  const start =
    selection.from !== null ? atTime(selection.from, arrivalTime) : null
  const end = selection.to !== null ? atTime(selection.to, departureTime) : null
  const isBackwards = start !== null && end !== null && end <= start
  const duration =
    start !== null && end !== null && !isBackwards
      ? describeDuration(end.getTime() - start.getTime())
      : ""

  const stayLabel = isDayVisit
    ? `no overnight, ${duration}`
    : `${nights} night${nights === 1 ? "" : "s"}, ${duration}`

  return (
    <Card className="p-5">
      <MonthCalendar
        spans={spans}
        initialYear={initialYear}
        initialMonth={initialMonth}
        highlight={highlight}
        selection={canBook ? selection : undefined}
        onDayDown={canBook ? beginAt : undefined}
        onDayEnter={canBook ? extendTo : undefined}
      />

      {canBook && selection.from && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <motion.div
            initial={reduced ? false : { y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="pointer-events-auto flex items-center gap-2 rounded-(--radius-4xl) border bg-background/90 py-1.5 pr-1.5 pl-3.5 shadow-lg backdrop-blur"
          >
            <span className="text-xs">
              {selection.to
                ? isBackwards
                  ? `${dayLabel(selection.from)} ${arrivalLabel} to ${departureLabel} · check the times`
                  : isDayVisit
                    ? `${dayLabel(selection.from)} ${arrivalLabel} to ${departureLabel} · ${stayLabel}`
                    : `${dayLabel(selection.from)} ${arrivalLabel} to ${dayLabel(selection.to)} ${departureLabel} · ${stayLabel}`
                : `${dayLabel(selection.from)} · pick the day you leave, or click again for a day visit`}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Clear selected dates"
              title="Clear"
              onClick={clear}
              className="rounded-full"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={12} />
            </Button>
          </motion.div>
        </div>
      )}

      {canBook && (
        <>
          {notice && (
            <p
              role="status"
              className="mt-4 border-t pt-4 text-destructive text-xs"
            >
              {notice}
            </p>
          )}

          <AnimatePresence initial={false}>
            {selection.from && selection.to && (
              <motion.form
                action={action}
                initial={reduced ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-4">
                  <input type="hidden" name="slug" value={slug} />
                  <input
                    type="hidden"
                    name="checkIn"
                    value={toDateInput(selection.from)}
                  />
                  <input
                    type="hidden"
                    name="checkOut"
                    value={toDateInput(selection.to)}
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <TimeChoice
                      name="arrivalTime"
                      legend="Arriving"
                      choices={config.booking.arrivalChoices}
                      value={arrivalTime}
                      onChange={setArrivalTime}
                    />
                    <TimeChoice
                      name="departureTime"
                      legend="Leaving"
                      choices={config.booking.departureChoices}
                      value={departureTime}
                      onChange={setDepartureTime}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      {isOwner
                        ? "A note for your own records"
                        : "Anything the owner should know"}
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      rows={2}
                      maxLength={500}
                      placeholder={
                        isOwner
                          ? "Family staying, no cleaning needed."
                          : "Two of us, arriving late."
                      }
                    />
                  </div>

                  {isBackwards && (
                    <p role="alert" className="text-destructive text-sm">
                      Leaving {departureLabel} is before arriving {arrivalLabel}
                      . Pick a later time to leave.
                    </p>
                  )}

                  {state.error && (
                    <p role="alert" className="text-destructive text-sm">
                      {state.error}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="submit"
                      disabled={isPending || isBackwards}
                      className="h-10 flex-1 px-4"
                    >
                      {isPending
                        ? "Saving..."
                        : `${isOwner ? "Block" : "Request"} ${
                            isDayVisit
                              ? "a day visit"
                              : `${nights} night${nights === 1 ? "" : "s"}`
                          }`}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={clear}
                      className="h-10 px-4"
                    >
                      Clear
                    </Button>
                  </div>

                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {isOwner
                      ? "Yours is confirmed straight away and holds the dates."
                      : "Asking holds nothing. The dates stay open to everyone until the owner approves."}
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </>
      )}
    </Card>
  )
}
