import type { Metadata } from "next"
import Link from "next/link"
import { EmptyState, PropertyCard } from "@/components/dashboard"
import { ReservationList } from "@/components/property"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = { title: "Dashboard" }

const cardFields = {
  id: true,
  slug: true,
  title: true,
  address: true,
  imageUrls: true,
  latitude: true,
  longitude: true,
  placeId: true,
  turnoverBufferMinutes: true,
  showReserverIdentity: true,
  isBookable: true,
} as const

type Row = {
  id: string
  slug: string
  title: string
  address: string
  imageUrls: string[]
  latitude: number | null
  longitude: number | null
  placeId: string | null
  turnoverBufferMinutes: number
  showReserverIdentity: boolean
  isBookable: boolean
}

const toSummary = (row: Row, pendingRequests = 0) => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  address: row.address,
  coverUrl: row.imageUrls[0] ?? null,
  latitude: row.latitude,
  longitude: row.longitude,
  placeId: row.placeId,
  turnoverBufferMinutes: row.turnoverBufferMinutes,
  showReserverIdentity: row.showReserverIdentity,
  isBookable: row.isBookable,
  pendingRequests,
})

const firstNameOf = (name: string) => name.split(" ")[0] || name

export default async function DashboardPage() {
  const { user } = await requireSession()

  const [owned, elsewhere, myReservations, totalProperties] = await Promise.all(
    [
      prisma.property.findMany({
        where: { ownerId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          ...cardFields,
          _count: {
            select: { reservations: { where: { status: "PENDING" } } },
          },
        },
      }),
      prisma.property.findMany({
        where: { ownerId: { not: user.id }, isBookable: true },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: cardFields,
      }),
      prisma.reservation.findMany({
        where: { guestId: user.id, status: { in: ["PENDING", "CONFIRMED"] } },
        orderBy: { checkIn: "asc" },
        take: 10,
        select: {
          id: true,
          checkIn: true,
          checkOut: true,
          blockedUntil: true,
          status: true,
          notes: true,
          guestId: true,
          property: { select: { title: true, slug: true } },
          guest: { select: { name: true, email: true, image: true } },
        },
      }),
      prisma.property.count(),
    ]
  )

  const waiting = owned.reduce(
    (total, property) => total + property._count.reservations,
    0
  )

  const greeting =
    owned.length > 0
      ? waiting === 0
        ? "No requests waiting on you."
        : `${waiting} request${waiting === 1 ? "" : "s"} waiting on you.`
      : myReservations.length > 0
        ? `You have ${myReservations.length} stay${myReservations.length === 1 ? "" : "s"} on the books.`
        : "Find somewhere to stay."

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading font-semibold text-3xl tracking-[-0.02em]">
            Hello, {firstNameOf(user.name)}
          </h1>
          <p className="mt-2 text-muted-foreground">{greeting}</p>
        </div>
        {owned.length > 0 && (
          <Button
            render={<Link href="/dashboard/properties/new" />}
            nativeButton={false}
          >
            Add a property
          </Button>
        )}
      </header>

      {owned.length > 0 && (
        <section className="mt-10">
          <h2 className="font-medium text-sm">Your properties</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {owned.map((property) => (
              <PropertyCard
                key={property.id}
                property={toSummary(property, property._count.reservations)}
                manageHref={`/dashboard/properties/${property.id}`}
              />
            ))}
          </div>
        </section>
      )}

      {myReservations.length > 0 && (
        <section className="mt-10">
          <h2 className="font-medium text-sm">Your stays</h2>
          <Card className="mt-4 p-5">
            <ReservationList
              reservations={myReservations.map((reservation) => ({
                visibility: "identified" as const,
                id: reservation.id,
                checkIn: reservation.checkIn,
                checkOut: reservation.checkOut,
                blockedUntil: reservation.blockedUntil,
                status: reservation.status,
                reserver: {
                  name: reservation.property.title,
                  email: reservation.guest.email,
                  image: null,
                },
                notes: reservation.notes,
              }))}
            />
          </Card>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-medium text-sm">
          {owned.length > 0 ? "Other places" : "Places to stay"}
        </h2>
        <div className="mt-4">
          {elsewhere.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {elsewhere.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={toSummary(property)}
                />
              ))}
            </div>
          ) : totalProperties === 0 ? (
            <EmptyState
              title="Nothing here yet"
              description="No one has added a place. Be the first: set how long you need between guests, and whether anyone sees who is staying."
              action={
                <Button
                  render={<Link href="/dashboard/properties/new" />}
                  nativeButton={false}
                  size="lg"
                  className="h-11 px-5 text-base"
                >
                  Add a property
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="Nothing open right now"
              description="Every place is closed to requests at the moment. Check back later."
            />
          )}
        </div>
      </section>
    </div>
  )
}
