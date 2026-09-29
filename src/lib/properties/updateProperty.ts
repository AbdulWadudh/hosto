"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"

export type UpdatePropertyState = { error: string | null; saved: boolean }

export async function updatePropertySettings(
  _previous: UpdatePropertyState,
  form: FormData
): Promise<UpdatePropertyState> {
  const { user } = await requireSession()
  const id = String(form.get("id") ?? "")

  const property = await prisma.property.findUnique({
    where: { id },
    select: { id: true, slug: true, ownerId: true },
  })

  if (!property) {
    return { error: "That property no longer exists.", saved: false }
  }

  const isAdmin = user.role === "admin"
  if (property.ownerId !== user.id && !isAdmin) {
    return { error: "This is not your property.", saved: false }
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
  const nightlyPriceRaw = String(form.get("nightlyPrice") ?? "").trim()
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

  await prisma.property.update({
    where: { id: property.id },
    data: {
      turnoverBufferMinutes,
      showReserverIdentity: form.get("showReserverIdentity") === "on",
      isBookable: form.get("isBookable") === "on",
      pricingEnabled,
      nightlyPrice: nightlyPrice?.toFixed(2) ?? null,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/properties/${property.id}`)
  revalidatePath(`/p/${property.slug}`)

  return { error: null, saved: true }
}
