"use client"

import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CommandDialog } from "@/components/ui/command-dialog"
import { DialogClose } from "@/components/ui/dialog"
import { dayLabel } from "@/lib/calendar/month"
import type { ReservationView } from "@/lib/properties/reservationView"

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"

const nameOf = (reservation: ReservationView) =>
  reservation.visibility === "identified"
    ? reservation.reserver.name
    : "Reserved"

const statusOf = (reservation: ReservationView) =>
  reservation.status === "PENDING"
    ? "Waiting"
    : reservation.visibility === "identified"
      ? "Booked"
      : "Reserved"

export function ReservationList({
  reservations,
}: {
  reservations: ReservationView[]
}) {
  const [open, setOpen] = useState<ReservationView | null>(null)

  if (reservations.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nothing on the calendar yet.
      </p>
    )
  }

  return (
    <>
      <ul className="divide-y">
        {reservations.map((reservation) => (
          <li key={reservation.id}>
            <button
              type="button"
              onClick={() => setOpen(reservation)}
              className="flex w-full items-center gap-3 rounded-(--radius-md) py-3 text-left transition-colors hover:bg-muted/40"
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
                  {nameOf(reservation)}
                </p>
                <p className="truncate text-muted-foreground text-xs">
                  {dayLabel(reservation.checkIn)} to{" "}
                  {dayLabel(reservation.checkOut)}
                </p>
              </div>

              <Badge
                variant={
                  reservation.status === "PENDING" ? "secondary" : "default"
                }
              >
                {statusOf(reservation)}
              </Badge>
            </button>
          </li>
        ))}
      </ul>

      <CommandDialog
        open={open !== null}
        onOpenChange={(next) => {
          if (!next) {
            setOpen(null)
          }
        }}
        icon={Calendar03Icon}
        title={open ? nameOf(open) : ""}
        description={
          open
            ? `${dayLabel(open.checkIn)} to ${dayLabel(open.checkOut)}`
            : undefined
        }
        footer={
          <DialogClose
            render={
              <Button type="button" variant="outline">
                Close
              </Button>
            }
          />
        }
      >
        {open && (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd>{statusOf(open)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Arrives</dt>
              <dd>{open.checkIn.toLocaleString("en-GB")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Leaves</dt>
              <dd>{open.checkOut.toLocaleString("en-GB")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Held until</dt>
              <dd>{open.blockedUntil.toLocaleString("en-GB")}</dd>
            </div>
            {open.visibility === "identified" && (
              <>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="truncate">{open.reserver.email}</dd>
                </div>
                {open.notes && (
                  <div className="space-y-1 border-t pt-3">
                    <dt className="text-muted-foreground">Note</dt>
                    <dd className="leading-relaxed">{open.notes}</dd>
                  </div>
                )}
              </>
            )}
            {open.visibility === "anonymous" && (
              <p className="border-t pt-3 text-muted-foreground text-xs leading-relaxed">
                The owner keeps who is staying private, so only the dates are
                shown.
              </p>
            )}
          </dl>
        )}
      </CommandDialog>
    </>
  )
}
