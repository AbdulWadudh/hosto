"use client"

import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { useState } from "react"
import { ReservationDecision } from "@/components/property/ReservationDecision"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CommandDialog } from "@/components/ui/command-dialog"
import { dayLabel, momentLabel } from "@/lib/calendar/month"
import type { ReservationView } from "@/lib/properties/reservationView"
import { cn } from "@/lib/utils"

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"

const nameOf = (reservation: ReservationView) =>
  reservation.isYours
    ? "You"
    : reservation.visibility === "identified"
      ? reservation.reserver.name
      : "Reserved"

const statusOf = (reservation: ReservationView) =>
  reservation.status === "PENDING"
    ? reservation.isYours
      ? "Waiting on the owner"
      : "Waiting"
    : reservation.visibility === "identified"
      ? "Booked"
      : "Reserved"

export function ReservationList({
  reservations,
  canDecide = false,
  focusedId = null,
  onFocus,
}: {
  reservations: ReservationView[]
  canDecide?: boolean
  focusedId?: string | null
  onFocus?: (id: string) => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = reservations.find((one) => one.id === openId) ?? null

  if (reservations.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nothing on the calendar yet.
      </p>
    )
  }

  return (
    <>
      <ul className="-mx-2 divide-y">
        {reservations.map((reservation) => (
          <li key={reservation.id}>
            <button
              type="button"
              onClick={() => {
                onFocus?.(reservation.id)
                setOpenId(reservation.id)
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-(--radius-lg) px-2 py-2 text-left transition-colors hover:bg-muted/40",
                focusedId === reservation.id && "bg-muted/60"
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
                {reservation.status === "PENDING" ? "Waiting" : "Booked"}
              </Badge>
            </button>
          </li>
        ))}
      </ul>

      <CommandDialog
        open={open !== null}
        onOpenChange={(next) => {
          if (!next) {
            setOpenId(null)
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
          open && canDecide ? (
            <ReservationDecision
              reservationId={open.id}
              isPendingRequest={open.status === "PENDING"}
            />
          ) : undefined
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
              <dd>{momentLabel(open.checkIn)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Leaves</dt>
              <dd>{momentLabel(open.checkOut)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Held until</dt>
              <dd>{momentLabel(open.blockedUntil)}</dd>
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
