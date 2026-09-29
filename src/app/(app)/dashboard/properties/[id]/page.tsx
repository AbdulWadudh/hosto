import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MonthCalendar } from "@/components/calendar"
import { PropertySettingsForm } from "@/components/dashboard/PropertySettingsForm"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = { title: "Property settings" }

export default async function PropertySettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { user } = await requireSession()

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      reservations: {
        where: { status: { in: ["PENDING", "CONFIRMED"] } },
        orderBy: { checkIn: "asc" },
        select: {
          id: true,
          checkIn: true,
          checkOut: true,
          blockedUntil: true,
          status: true,
          guest: { select: { name: true } },
        },
      },
    },
  })

  if (!property || (property.ownerId !== user.id && user.role !== "admin")) {
    notFound()
  }

  const now = new Date()

  return (
    <div className="mx-auto w-full max-w-3xl px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading font-semibold text-3xl tracking-[-0.02em]">
            {property.title}
          </h1>
          <p className="mt-1.5 text-muted-foreground">{property.address}</p>
        </div>
        <Button
          render={<Link href="/dashboard" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
        >
          Back
        </Button>
      </div>

      <Card className="mt-8 p-5">
        <MonthCalendar
          spans={property.reservations.map((reservation) => ({
            ...reservation,
            label: reservation.guest.name,
          }))}
          initialYear={now.getFullYear()}
          initialMonth={now.getMonth()}
        />
      </Card>

      <h2 className="mt-10 font-heading font-semibold text-lg tracking-tight">
        Settings
      </h2>
      <div className="mt-4">
        <PropertySettingsForm
          property={{
            id: property.id,
            slug: property.slug,
            title: property.title,
            address: property.address,
            description: property.description,
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
          }}
        />
      </div>
    </div>
  )
}
