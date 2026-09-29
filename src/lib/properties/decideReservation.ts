"use server"

import { revalidatePath } from "next/cache"
import { decisionMade } from "@/lib/notify"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"

export type DecisionState = { error: string | null }

export async function decideReservation(
  _previous: DecisionState,
  form: FormData
): Promise<DecisionState> {
  const { user } = await requireSession()

  const id = String(form.get("reservationId") ?? "")
  const approving = String(form.get("decision") ?? "") === "approve"

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    select: {
      blockedUntil: true,
      status: true,
      checkIn: true,
      checkOut: true,
      guest: { select: { email: true } },
      property: { select: { ownerId: true, slug: true, title: true } },
    },
  })

  if (!reservation) {
    return { error: "That request no longer exists." }
  }
  if (reservation.property.ownerId !== user.id && user.role !== "admin") {
    return { error: "Only the owner can decide this one." }
  }
  if (reservation.status === "CANCELLED") {
    return { error: "The guest cancelled this one. Only they can undo that." }
  }
  if (reservation.blockedUntil <= new Date()) {
    return { error: "Those dates have already passed and cannot be changed." }
  }

  try {
    await prisma.reservation.update({
      where: { id },
      data: { status: approving ? "CONFIRMED" : "REJECTED" },
    })
  } catch (failure) {
    const message = failure instanceof Error ? failure.message : ""
    return {
      error: message.includes("reservation_no_overlap")
        ? "Another stay already holds those nights, including its turnover window."
        : "Something went wrong saving that. Try again.",
    }
  }

  await decisionMade(reservation.guest.email, approving, {
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    propertyTitle: reservation.property.title,
    propertySlug: reservation.property.slug,
  })

  revalidatePath(`/p/${reservation.property.slug}`)
  revalidatePath("/dashboard")
  return { error: null }
}
