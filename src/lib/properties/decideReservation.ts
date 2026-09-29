"use server"

import { revalidatePath } from "next/cache"
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
      property: { select: { ownerId: true, slug: true } },
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

  revalidatePath(`/p/${reservation.property.slug}`)
  revalidatePath("/dashboard")
  return { error: null }
}
