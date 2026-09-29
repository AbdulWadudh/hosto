"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { AvailabilityBooking } from "@/components/property/AvailabilityBooking"
import { ReservationDialog } from "@/components/property/ReservationDialog"
import { ReservationList } from "@/components/property/ReservationList"
import { Card } from "@/components/ui/card"
import type { Span } from "@/lib/calendar/month"
import {
  type ReservationView,
  reserverName,
} from "@/lib/properties/reservationView"

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
  const [openId, setOpenId] = useState<string | null>(null)

  const find = (id: string | null) =>
    reservations.find((one) => one.id === id) ?? null

  const pick = (id: string) => {
    setFocusedId(id)
    setOpenId(id)
  }

  const spans: Span[] = reservations.map((reservation) => ({
    id: reservation.id,
    label:
      reservation.visibility === "identified"
        ? reserverName(reservation)
        : null,
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
        highlight={find(focusedId)}
        onSpanPick={pick}
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
              focusedId={focusedId}
              onPick={pick}
            />
          </div>
        </Card>
      </aside>

      <ReservationDialog
        reservation={find(openId)}
        canDecide={canManage}
        onClose={() => setOpenId(null)}
      />
    </div>
  )
}
