import type { Metadata } from "next"
import Link from "next/link"
import { EmptyState, PropertyCard } from "@/components/dashboard"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = { title: "Dashboard" }

const firstNameOf = (name: string) => name.split(" ")[0] || name

export default async function DashboardPage() {
  const { user } = await requireSession()

  const properties = await prisma.property.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      address: true,
      turnoverBufferMinutes: true,
      showReserverIdentity: true,
      _count: { select: { reservations: { where: { status: "PENDING" } } } },
    },
  })

  const waiting = properties.reduce(
    (total, property) => total + property._count.reservations,
    0
  )

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading font-semibold text-3xl tracking-[-0.02em]">
            Hello, {firstNameOf(user.name)}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {properties.length === 0
              ? "Nothing on the calendar yet."
              : waiting === 0
                ? "No requests waiting on you."
                : `${waiting} request${waiting === 1 ? "" : "s"} waiting on you.`}
          </p>
        </div>
        {properties.length > 0 && (
          <Button
            render={<Link href="/dashboard/properties/new" />}
            nativeButton={false}
          >
            Add a property
          </Button>
        )}
      </header>

      <section className="mt-10">
        <h2 className="font-medium text-sm">Your properties</h2>
        <div className="mt-4">
          {properties.length === 0 ? (
            <EmptyState
              title="No properties yet"
              description="Add the first place you look after. You can set how long you need between guests, and whether anyone sees who is staying."
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
            <div className="grid gap-4 sm:grid-cols-2">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={{
                    id: property.id,
                    title: property.title,
                    address: property.address,
                    turnoverBufferMinutes: property.turnoverBufferMinutes,
                    showReserverIdentity: property.showReserverIdentity,
                    pendingRequests: property._count.reservations,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
