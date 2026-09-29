"use server"

import { revalidatePath } from "next/cache"
import { stayCancelled } from "@/lib/notify"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"

export type CancelState = { error: string | null }

export async function cancelReservation(
  _previous: CancelState,
  form: FormData
): Promise<CancelState> {
  const { user } = await requireSession()

  const id = String(form.get("reservationId") ?? "")
  const reason = String(form.get("reason") ?? "")
    .trim()
    .slice(0, 500)

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    select: {
      guestId: true,
      status: true,
      blockedUntil: true,
      checkIn: true,
      checkOut: true,
      property: {
        select: { slug: true, title: true, owner: { select: { email: true } } },
      },
    },
  })

  if (!reservation) {
    return { error: "That reservation no longer exists." }
  }
  if (reservation.guestId !== user.id) {
    return { error: "Only the person who booked it can cancel it." }
  }
  if (reservation.status !== "PENDING" && reservation.status !== "CONFIRMED") {
    return { error: "That reservation is already over." }
  }
  if (reservation.blockedUntil <= new Date()) {
    return { error: "Those dates have already passed and cannot be changed." }
  }

  await prisma.reservation.update({
    where: { id },
    data: { status: "CANCELLED", endedReason: reason || null },
  })

  await stayCancelled(
    reservation.property.owner.email,
    user.name,
    {
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      propertyTitle: reservation.property.title,
      propertySlug: reservation.property.slug,
    },
    reason || null
  )

  revalidatePath(`/p/${reservation.property.slug}`)
  revalidatePath("/dashboard")
  return { error: null }
}
