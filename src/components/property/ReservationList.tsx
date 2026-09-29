import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { dayLabel } from "@/lib/calendar/month"
import type { ReservationView } from "@/lib/properties/reservationView"

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"

export function ReservationList({
  reservations,
}: {
  reservations: ReservationView[]
}) {
  if (reservations.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nothing on the calendar yet.
      </p>
    )
  }

  return (
    <ul className="divide-y">
      {reservations.map((reservation) => (
        <li
          key={reservation.id}
          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        >
          {reservation.visibility === "identified" ? (
            <Avatar className="size-8 border">
              {reservation.reserver.image && (
                <AvatarImage src={reservation.reserver.image} alt="" />
              )}
              <AvatarFallback className="bg-primary/15 font-medium text-[0.65rem] text-primary">
                {initialsOf(reservation.reserver.name)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <span
              aria-hidden
              className="size-8 shrink-0 rounded-full border border-dashed bg-muted/40"
            />
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">
              {reservation.visibility === "identified"
                ? reservation.reserver.name
                : "Reserved"}
            </p>
            <p className="truncate text-muted-foreground text-xs">
              {dayLabel(reservation.checkIn)} to{" "}
              {dayLabel(reservation.checkOut)}
            </p>
          </div>

          <Badge
            variant={reservation.status === "PENDING" ? "secondary" : "default"}
          >
            {reservation.status === "PENDING"
              ? "Waiting"
              : reservation.visibility === "identified"
                ? "Booked"
                : "Reserved"}
          </Badge>
        </li>
      ))}
    </ul>
  )
}
