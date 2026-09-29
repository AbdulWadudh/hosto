"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"

export type RequestDatesState = { error: string | null }

const minuteMs = 60 * 1000

export async function requestDates(
  _previous: RequestDatesState,
  form: FormData
): Promise<RequestDatesState> {
  const { user } = await requireSession()

  const slug = String(form.get("slug") ?? "")
  const property = await prisma.property.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      isBookable: true,
      turnoverBufferMinutes: true,
    },
  })

  if (!property) {
    return { error: "That property no longer exists." }
  }
  if (!property.isBookable) {
    return { error: "This place is not taking requests at the moment." }
  }

  const checkIn = new Date(String(form.get("checkIn") ?? ""))
  const checkOut = new Date(String(form.get("checkOut") ?? ""))

  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    return { error: "Pick both an arrival and a departure date." }
  }
  if (checkOut <= checkIn) {
    return { error: "Departure has to be after arrival." }
  }
  if (checkIn < new Date()) {
    return { error: "Arrival cannot be in the past." }
  }

  const notes = String(form.get("notes") ?? "")
    .trim()
    .slice(0, 500)
  const blockedUntil = new Date(
    checkOut.getTime() + property.turnoverBufferMinutes * minuteMs
  )

  await prisma.reservation.create({
    data: {
      propertyId: property.id,
      guestId: user.id,
      checkIn,
      checkOut,
      blockedUntil,
      notes: notes || null,
    },
  })

  revalidatePath(`/p/${property.slug}`)
  revalidatePath("/dashboard")
  redirect(`/p/${property.slug}?requested=1`)
}
