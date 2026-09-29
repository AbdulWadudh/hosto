import "server-only"
import { cache } from "react"
import { prisma } from "@/lib/prisma"
import {
  projectReservation,
  type ReservationView,
  type Viewer,
} from "@/lib/properties/reservationView"
import { getSession } from "@/lib/session"

export type PropertyDetail = {
  id: string
  slug: string
  title: string
  address: string
  description: string
  imageUrls: string[]
  latitude: number | null
  longitude: number | null
  placeId: string | null
  maxGuests: number
  turnoverBufferMinutes: number
  showReserverIdentity: boolean
  isBookable: boolean
  pricingEnabled: boolean
  nightlyPrice: string | null
  currency: string
  isOwner: boolean
  reservations: ReservationView[]
}

export const getPropertyBySlug = cache(
  async (slug: string): Promise<PropertyDetail | null> => {
    const session = await getSession()
    const viewer: Viewer = session
      ? { id: session.user.id, isAdmin: session.user.role === "admin" }
      : null

    const property = await prisma.property.findUnique({ where: { slug } })

    if (!property) {
      return null
    }

    const isOwner = viewer !== null && viewer.id === property.ownerId
    const maySeePending = isOwner || (viewer?.isAdmin ?? false)

    const reservations = await prisma.reservation.findMany({
      where: {
        propertyId: property.id,
        status: maySeePending
          ? { in: ["PENDING", "CONFIRMED"] }
          : { equals: "CONFIRMED" },
      },
      orderBy: { checkIn: "asc" },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        blockedUntil: true,
        status: true,
        notes: true,
        guestId: true,
        guest: { select: { name: true, email: true, image: true } },
      },
    })

    return {
      id: property.id,
      slug: property.slug,
      title: property.title,
      address: property.address,
      description: property.description,
      imageUrls: property.imageUrls,
      latitude: property.latitude,
      longitude: property.longitude,
      placeId: property.placeId,
      maxGuests: property.maxGuests,
      turnoverBufferMinutes: property.turnoverBufferMinutes,
      showReserverIdentity: property.showReserverIdentity,
      isBookable: property.isBookable,
      pricingEnabled: property.pricingEnabled,
      nightlyPrice: property.nightlyPrice?.toFixed(2) ?? null,
      currency: property.currency.trim(),
      isOwner,
      reservations: reservations.map((reservation) =>
        projectReservation(reservation, property, viewer)
      ),
    }
  }
)
