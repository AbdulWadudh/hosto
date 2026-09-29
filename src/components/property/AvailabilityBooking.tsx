"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useActionState, useState } from "react"
import { MonthCalendar, type Selection } from "@/components/calendar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  dayLabel,
  nightsBetween,
  type Span,
  toDateInput,
} from "@/lib/calendar/month"
import {
  requestDates,
  type RequestDatesState,
} from "@/lib/properties/requestDates"

export function AvailabilityBooking({
  slug,
  spans,
  initialYear,
  initialMonth,
  canBook,
  isOwner,
}: {
  slug: string
  spans: Span[]
  initialYear: number
  initialMonth: number
  canBook: boolean
  isOwner: boolean
}) {
  const [selection, setSelection] = useState<Selection>({
    from: null,
    to: null,
  })
  const [state, action, isPending] = useActionState<
    RequestDatesState,
    FormData
  >(requestDates, { error: null })
  const reduced = useReducedMotion()

  const pick = (date: Date) => {
    setSelection((current) => {
      if (!current.from || current.to || date < current.from) {
        return { from: date, to: null }
      }
      if (date.getTime() === current.from.getTime()) {
        return { from: null, to: null }
      }
      return { from: current.from, to: date }
    })
  }

  const nights =
    selection.from && selection.to
      ? nightsBetween(selection.from, selection.to)
      : 0

  return (
    <Card className="p-5">
      <MonthCalendar
        spans={spans}
        initialYear={initialYear}
        initialMonth={initialMonth}
        selection={canBook ? selection : undefined}
        onSelectDay={canBook ? pick : undefined}
      />

      {canBook && (
        <>
          <p className="mt-4 border-t pt-4 text-muted-foreground text-xs">
            {selection.from
              ? selection.to
                ? `${dayLabel(selection.from)} to ${dayLabel(selection.to)} - ${nights} night${nights === 1 ? "" : "s"}`
                : "Now pick the day you leave."
              : "Pick the day you arrive, then the day you leave."}
          </p>

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

                  {state.error && (
                    <p role="alert" className="text-destructive text-sm">
                      {state.error}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="h-10 flex-1 px-4"
                    >
                      {isPending
                        ? "Saving..."
                        : isOwner
                          ? `Block ${nights} night${nights === 1 ? "" : "s"}`
                          : `Request ${nights} night${nights === 1 ? "" : "s"}`}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setSelection({ from: null, to: null })}
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
