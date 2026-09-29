"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"

export type UpdatePropertyState = { error: string | null; saved: boolean }

const readText = (form: FormData, field: string) =>
  String(form.get(field) ?? "").trim()

export async function updatePropertySettings(
  _previous: UpdatePropertyState,
  form: FormData
): Promise<UpdatePropertyState> {
  const { user } = await requireSession()
  const id = String(form.get("id") ?? "")

  const property = await prisma.property.findUnique({
    where: { id },
    select: { id: true, slug: true, ownerId: true, address: true },
  })

  if (!property) {
    return { error: "That property no longer exists.", saved: false }
  }

  const isAdmin = user.role === "admin"
  if (property.ownerId !== user.id && !isAdmin) {
    return { error: "This is not your property.", saved: false }
  }

  const title = readText(form, "title")
  if (title.length < 2) {
    return {
      error: "Give the place a name of at least two characters.",
      saved: false,
    }
  }

  const address = readText(form, "address") || property.address
  if (address.length < 4) {
    return {
      error: "An address helps you tell two places apart.",
      saved: false,
    }
  }

  const maxGuests = Number(form.get("maxGuests"))
  if (!Number.isInteger(maxGuests) || maxGuests < 1 || maxGuests > 200) {
    return {
      error: "Sleeping capacity must be a whole number from 1 to 200.",
      saved: false,
    }
  }

  const turnoverBufferMinutes = Number(form.get("turnoverBufferMinutes"))
  if (
    !Number.isInteger(turnoverBufferMinutes) ||
    turnoverBufferMinutes < 0 ||
    turnoverBufferMinutes > 20160
  ) {
    return {
      error: "Choose a turnover window of up to two weeks.",
      saved: false,
    }
  }

  const pricingEnabled = form.get("pricingEnabled") === "on"
  const nightlyPriceRaw = readText(form, "nightlyPrice")
  const nightlyPrice = pricingEnabled ? Number(nightlyPriceRaw) : null

  if (
    pricingEnabled &&
    (!Number.isFinite(nightlyPrice) || (nightlyPrice ?? 0) <= 0)
  ) {
    return {
      error: "A published rate needs a nightly price above zero.",
      saved: false,
    }
  }

  const latitude = Number(form.get("latitude"))
  const longitude = Number(form.get("longitude"))
  const hasCoordinates =
    readText(form, "latitude") !== "" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180

  const imageUrls = form
    .getAll("imageUrls")
    .map((value) => String(value))
    .filter((value) => value.length > 0)

  await prisma.property.update({
    where: { id: property.id },
    data: {
      title,
      address,
      description: readText(form, "description"),
      imageUrls,
      maxGuests,
      turnoverBufferMinutes,
      showReserverIdentity: form.get("showReserverIdentity") === "on",
      isBookable: form.get("isBookable") === "on",
      pricingEnabled,
      nightlyPrice: nightlyPrice?.toFixed(2) ?? null,
      ...(hasCoordinates
        ? {
            latitude,
            longitude,
            placeId: readText(form, "placeId") || null,
          }
        : {}),
    },
  })

  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/properties/${property.id}`)
  revalidatePath(`/p/${property.slug}`)

  return { error: null, saved: true }
}
