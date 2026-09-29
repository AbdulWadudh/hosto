"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"

export type CreatePropertyState = { error: string | null }

const slugify = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)

const readText = (form: FormData, field: string) =>
  String(form.get(field) ?? "").trim()

export async function createProperty(
  _previous: CreatePropertyState,
  form: FormData
): Promise<CreatePropertyState> {
  const { user } = await requireSession()

  const title = readText(form, "title")
  const address = readText(form, "address")
  const description = readText(form, "description")
  const maxGuests = Number(form.get("maxGuests"))
  const turnoverBufferMinutes = Number(form.get("turnoverBufferMinutes"))
  const pricingEnabled = form.get("pricingEnabled") === "on"
  const showReserverIdentity = form.get("showReserverIdentity") === "on"
  const nightlyPriceRaw = readText(form, "nightlyPrice")

  if (title.length < 2) {
    return { error: "Give the place a name of at least two characters." }
  }
  if (address.length < 4) {
    return { error: "An address helps you tell two places apart." }
  }
  if (!Number.isInteger(maxGuests) || maxGuests < 1 || maxGuests > 64) {
    return { error: "Sleeping capacity must be a whole number from 1 to 64." }
  }
  if (
    !Number.isInteger(turnoverBufferMinutes) ||
    turnoverBufferMinutes < 0 ||
    turnoverBufferMinutes > 20160
  ) {
    return { error: "Choose a turnover window of up to two weeks." }
  }

  const nightlyPrice = pricingEnabled ? Number(nightlyPriceRaw) : null
  if (
    pricingEnabled &&
    (!Number.isFinite(nightlyPrice) || (nightlyPrice ?? 0) <= 0)
  ) {
    return { error: "A published rate needs a nightly price above zero." }
  }

  const slug = slugify(title)
  if (!slug) {
    return { error: "That name cannot be turned into a web address." }
  }

  const taken = await prisma.property.findUnique({ where: { slug } })
  if (taken) {
    return { error: "A property with a very similar name already exists." }
  }

  await prisma.property.create({
    data: {
      slug,
      title,
      address,
      description,
      imageUrls: [],
      maxGuests,
      turnoverBufferMinutes,
      pricingEnabled,
      nightlyPrice: nightlyPrice?.toFixed(2) ?? null,
      showReserverIdentity,
      ownerId: user.id,
    },
  })

  revalidatePath("/dashboard")
  redirect("/dashboard")
}
