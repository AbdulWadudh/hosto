"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"

export type RequestDatesState = { error: string | null }

const minuteMs = 60 * 1000

function describeWriteFailure(failure: unknown): string {
  const message = failure instanceof Error ? failure.message : ""

  if (message.includes("reservation_no_overlap")) {
    return "Those nights are already taken, including the turnover window after the stay before."
  }
  if (message.includes("reservation_dates_ordered")) {
    return "Departure has to be after arrival."
  }
  return "Something went wrong saving that. Try again."
}

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
      ownerId: true,
      turnoverBufferMinutes: true,
    },
  })

  if (!property) {
    return { error: "That property no longer exists." }
  }

  const isOwner = property.ownerId === user.id

  if (!property.isBookable && !isOwner) {
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

  const notes = String(form.get("notes") ?? "")
    .trim()
    .slice(0, 500)
  const blockedUntil = new Date(
    checkOut.getTime() + property.turnoverBufferMinutes * minuteMs
  )

  try {
    await prisma.reservation.create({
      data: {
        propertyId: property.id,
        guestId: user.id,
        checkIn,
        checkOut,
        blockedUntil,
        notes: notes || null,
        status: isOwner ? "CONFIRMED" : "PENDING",
      },
    })
  } catch (failure) {
    return { error: describeWriteFailure(failure) }
  }

  revalidatePath(`/p/${property.slug}`)
  revalidatePath("/dashboard")
  redirect(`/p/${property.slug}`)
}
