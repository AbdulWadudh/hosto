"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { dayRangeLabel } from "@/lib/calendar/month"
import {
  type ReservationView,
  reservationStatusLabel,
  reserverName,
} from "@/lib/properties/reservationView"
import { cn } from "@/lib/utils"

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"

export function ReservationList({
  reservations,
  titles,
  focusedId = null,
  onPick,
}: {
  reservations: ReservationView[]
  titles?: Record<string, string>
  focusedId?: string | null
  onPick: (id: string) => void
}) {
  if (reservations.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nothing on the calendar yet.
      </p>
    )
  }

  return (
    <ul className="-mx-2 divide-y">
      {reservations.map((reservation) => (
        <li key={reservation.id}>
          <button
            type="button"
            onClick={() => onPick(reservation.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-(--radius-lg) px-2 py-2 text-left transition-colors hover:bg-muted/40",
              focusedId === reservation.id && "bg-muted/60",
              reservation.status === "REJECTED" && "opacity-60"
            )}
          >
            {reservation.visibility === "identified" ? (
              <Avatar className="size-7 border">
                {reservation.reserver.image && (
                  <AvatarImage src={reservation.reserver.image} alt="" />
                )}
                <AvatarFallback className="bg-primary/15 font-medium text-[0.6rem] text-primary">
                  {initialsOf(reservation.reserver.name)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <span
                aria-hidden
                className="size-7 shrink-0 rounded-full border border-dashed bg-muted/40"
              />
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">
                {titles?.[reservation.id] ?? reserverName(reservation)}
              </p>
              <p className="truncate text-muted-foreground text-xs">
                {dayRangeLabel(reservation.checkIn, reservation.checkOut)}
              </p>
            </div>

            <Badge
              variant={
                reservation.status === "CONFIRMED" ? "default" : "secondary"
              }
              className={
                reservation.status === "PENDING"
                  ? "border-amber-400/40 bg-amber-400/15 text-amber-200"
                  : undefined
              }
            >
              {reservation.status === "PENDING"
                ? "Waiting"
                : reservationStatusLabel(reservation)}
            </Badge>
          </button>
        </li>
      ))}
    </ul>
  )
}
