"use server"

import { revalidatePath } from "next/cache"
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
      property: { select: { slug: true } },
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

  revalidatePath(`/p/${reservation.property.slug}`)
  revalidatePath("/dashboard")
  return { error: null }
}
