"use client"

import {
  ArrowUpRight01Icon,
  Calendar03Icon,
  DeleteThrowIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useState } from "react"
import {
  CancelActions,
  CancelFields,
} from "@/components/property/ReservationCancel"
import { ReservationDecision } from "@/components/property/ReservationDecision"
import { Button } from "@/components/ui/button"
import { CommandDialog } from "@/components/ui/command-dialog"
import {
  dayRangeLabel,
  describeDuration,
  momentLabel,
} from "@/lib/calendar/month"
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

const isLive = (reservation: ReservationView | null) =>
  reservation?.status === "PENDING" || reservation?.status === "CONFIRMED"

export function ReservationDialog({
  reservation,
  canDecide,
  propertyHref,
  onClose,
}: {
  reservation: ReservationView | null
  canDecide: boolean
  propertyHref?: string
  onClose: () => void
}) {
  const [armedFor, setArmedFor] = useState<string | null>(null)

  const isPendingRequest = reservation?.status === "PENDING"
  const canCancel = (reservation?.isYours ?? false) && isLive(reservation)
  const arming = canCancel && armedFor === reservation?.id

  const showDecide =
    canDecide && reservation !== null && reservation.status !== "CANCELLED"

  const footer = arming ? (
    <CancelActions onKeep={() => setArmedFor(null)} />
  ) : reservation && (canCancel || showDecide || propertyHref) ? (
    <>
      {propertyHref && (
        <Button
          render={<Link href={propertyHref} />}
          nativeButton={false}
          variant="outline"
        >
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
          Open property
        </Button>
      )}
      {canCancel && (
        <Button
          type="button"
          variant="outline"
          className="text-destructive"
          onClick={() => setArmedFor(reservation.id)}
        >
          <HugeiconsIcon icon={DeleteThrowIcon} size={14} />
          {isPendingRequest ? "Withdraw" : "Cancel"}
        </Button>
      )}
      {showDecide && (
        <ReservationDecision
          reservationId={reservation.id}
          status={reservation.status}
        />
      )}
    </>
  ) : undefined

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
          ? dayRangeLabel(reservation.checkIn, reservation.checkOut)
          : undefined
      }
      footer={footer}
    >
      {reservation && arming && (
        <CancelFields
          reservationId={reservation.id}
          isPendingRequest={isPendingRequest}
        />
      )}

      {reservation && !arming && (
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
              {reservation.endedReason && (
                <div className="space-y-1 border-t pt-3">
                  <dt className="text-muted-foreground">
                    {reservation.status === "CANCELLED"
                      ? "Why it was cancelled"
                      : "Why it ended"}
                  </dt>
                  <dd className="leading-relaxed">{reservation.endedReason}</dd>
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
