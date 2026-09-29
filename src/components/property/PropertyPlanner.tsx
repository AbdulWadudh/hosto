"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { AvailabilityBooking } from "@/components/property/AvailabilityBooking"
import { ReservationList } from "@/components/property/ReservationList"
import { Card } from "@/components/ui/card"
import type { Span } from "@/lib/calendar/month"
import type { ReservationView } from "@/lib/properties/reservationView"

export function PropertyPlanner({
  slug,
  reservations,
  initialYear,
  initialMonth,
  canBook,
  isOwner,
  canManage,
  availability,
}: {
  slug: string
  reservations: ReservationView[]
  initialYear: number
  initialMonth: number
  canBook: boolean
  isOwner: boolean
  canManage: boolean
  availability: ReactNode
}) {
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const focused = reservations.find((one) => one.id === focusedId) ?? null

  const spans: Span[] = reservations.map((reservation) => ({
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    blockedUntil: reservation.blockedUntil,
    status: reservation.status,
  }))

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
      <AvailabilityBooking
        slug={slug}
        spans={spans}
        initialYear={initialYear}
        initialMonth={initialMonth}
        canBook={canBook}
        isOwner={isOwner}
        highlight={focused}
      />

      <aside className="space-y-4">
        {availability}

        <Card className="p-5">
          <h2 className="font-heading font-semibold tracking-tight">
            Who is staying
          </h2>
          {reservations.length > 0 && (
            <p className="mt-1 text-muted-foreground text-xs">
              Pick one to see it on the calendar.
            </p>
          )}
          <div className="mt-3">
            <ReservationList
              reservations={reservations}
              canDecide={canManage}
              focusedId={focusedId}
              onFocus={setFocusedId}
            />
          </div>
        </Card>
      </aside>
    </div>
  )
}
