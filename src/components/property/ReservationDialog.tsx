"use client"

import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { ReservationDecision } from "@/components/property/ReservationDecision"
import { CommandDialog } from "@/components/ui/command-dialog"
import { dayLabel, describeDuration, momentLabel } from "@/lib/calendar/month"
import {
  type ReservationView,
  reserverName,
  reservationStatusLabel,
} from "@/lib/properties/reservationView"

function Row({ term, children }: { term: string; children: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{term}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  )
}

export function ReservationDialog({
  reservation,
  canDecide,
  onClose,
}: {
  reservation: ReservationView | null
  canDecide: boolean
  onClose: () => void
}) {
  const turnover = reservation
    ? describeDuration(
        reservation.blockedUntil.getTime() - reservation.checkOut.getTime()
      )
    : ""

  return (
    <CommandDialog
      open={reservation !== null}
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
      icon={Calendar03Icon}
      title={reservation ? reserverName(reservation) : ""}
      description={
        reservation
          ? `${dayLabel(reservation.checkIn)} to ${dayLabel(reservation.checkOut)}`
          : undefined
      }
      footer={
        reservation && canDecide ? (
          <ReservationDecision
            reservationId={reservation.id}
            isPendingRequest={reservation.status === "PENDING"}
          />
        ) : undefined
      }
    >
      {reservation && (
        <dl className="space-y-3 text-sm">
          <Row term="Status">{reservationStatusLabel(reservation)}</Row>
          <Row term="Arrives">{momentLabel(reservation.checkIn)}</Row>
          <Row term="Leaves">{momentLabel(reservation.checkOut)}</Row>
          <Row term="Turnover after">{turnover}</Row>
          {reservation.visibility === "identified" && (
            <>
              <Row term="Email">{reservation.reserver.email}</Row>
              {reservation.notes && (
                <div className="space-y-1 border-t pt-3">
                  <dt className="text-muted-foreground">Note</dt>
                  <dd className="leading-relaxed">{reservation.notes}</dd>
                </div>
              )}
            </>
          )}
          {reservation.visibility === "anonymous" && (
            <p className="border-t pt-3 text-muted-foreground text-xs leading-relaxed">
              The owner keeps who is staying private, so only the dates are
              shown.
            </p>
          )}
        </dl>
      )}
    </CommandDialog>
  )
}
