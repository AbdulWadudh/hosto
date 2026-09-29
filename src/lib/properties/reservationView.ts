import type { ReservationStatus } from "@/generated/prisma/client"

export type ReservationRow = {
  id: string
  checkIn: Date
  checkOut: Date
  blockedUntil: Date
  status: ReservationStatus
  notes: string | null
  endedReason: string | null
  guestId: string
  guest: { name: string; email: string; image: string | null }
}

export type ReservationView =
  | {
      visibility: "identified"
      id: string
      checkIn: Date
      checkOut: Date
      blockedUntil: Date
      status: ReservationStatus
      isYours: boolean
      reserver: { name: string; email: string; image: string | null }
      notes: string | null
      endedReason: string | null
    }
  | {
      visibility: "anonymous"
      id: string
      checkIn: Date
      checkOut: Date
      blockedUntil: Date
      status: "RESERVED"
      isYours: false
    }

export type Viewer = {
  id: string
  isAdmin: boolean
} | null

export function projectReservation(
  reservation: ReservationRow,
  property: { ownerId: string; showReserverIdentity: boolean },
  viewer: Viewer
): ReservationView {
  const maySeeIdentity =
    property.showReserverIdentity ||
    (viewer !== null &&
      (viewer.isAdmin ||
        viewer.id === property.ownerId ||
        viewer.id === reservation.guestId))

  if (maySeeIdentity) {
    return {
      visibility: "identified",
      id: reservation.id,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      blockedUntil: reservation.blockedUntil,
      status: reservation.status,
      isYours: viewer?.id === reservation.guestId,
      reserver: reservation.guest,
      notes: reservation.notes,
      endedReason: reservation.endedReason,
    }
  }

  return {
    visibility: "anonymous",
    id: reservation.id,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    blockedUntil: reservation.blockedUntil,
    status: "RESERVED",
    isYours: false,
  }
}

export function reserverName(reservation: ReservationView): string {
  if (reservation.isYours) {
    return "You"
  }
  return reservation.visibility === "identified"
    ? reservation.reserver.name
    : "Reserved"
}

export function reservationStatusLabel(reservation: ReservationView): string {
  if (reservation.status === "PENDING") {
    return reservation.isYours ? "Waiting on the owner" : "Waiting"
  }
  if (reservation.status === "REJECTED") {
    return "Turned down"
  }
  if (reservation.status === "CANCELLED") {
    return "Cancelled"
  }
  return reservation.visibility === "identified" ? "Booked" : "Reserved"
}
