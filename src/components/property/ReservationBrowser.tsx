"use client"

import { useState } from "react"
import { ReservationDialog } from "@/components/property/ReservationDialog"
import { ReservationList } from "@/components/property/ReservationList"
import type { ReservationView } from "@/lib/properties/reservationView"

export function ReservationBrowser({
  reservations,
  canDecide = false,
  propertyHrefs,
}: {
  reservations: ReservationView[]
  canDecide?: boolean
  propertyHrefs?: Record<string, string>
}) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <>
      <ReservationList reservations={reservations} onPick={setOpenId} />
      <ReservationDialog
        reservation={reservations.find((one) => one.id === openId) ?? null}
        canDecide={canDecide}
        propertyHref={openId ? propertyHrefs?.[openId] : undefined}
        onClose={() => setOpenId(null)}
      />
    </>
  )
}
