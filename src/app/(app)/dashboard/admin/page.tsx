import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AdminUserRow } from "@/components/dashboard/AdminUserRow"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { dayRangeLabel } from "@/lib/calendar/month"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = { title: "Admin" }

export default async function AdminPage() {
  const { user } = await requireSession()

  if (user.role !== "admin") {
    notFound()
  }

  const [people, properties, waiting] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        _count: { select: { ownedProperties: true, reservations: true } },
      },
    }),
    prisma.property.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        isBookable: true,
        owner: { select: { name: true } },
        _count: { select: { reservations: true } },
      },
    }),
    prisma.reservation.findMany({
      where: { status: "PENDING" },
      orderBy: { checkIn: "asc" },
      take: 20,
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        guest: { select: { name: true } },
        property: { select: { title: true, slug: true } },
      },
    }),
  ])

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <header>
        <h1 className="font-heading font-semibold text-3xl tracking-[-0.02em]">
          Admin
        </h1>
        <p className="mt-2 text-muted-foreground">
          Everyone on this installation, every place, and every request nobody
          has answered.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="font-medium text-sm">
          People{" "}
          <span className="text-muted-foreground">({people.length})</span>
        </h2>
        <Card className="mt-4 px-5 py-4">
          <ul>
            {people.map((person) => (
              <AdminUserRow
                key={person.id}
                user={{
                  id: person.id,
                  name: person.name,
                  email: person.email,
                  image: person.image,
                  role: person.role ?? "user",
                  properties: person._count.ownedProperties,
                  reservations: person._count.reservations,
                  isYou: person.id === user.id,
                }}
              />
            ))}
          </ul>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="font-medium text-sm">
          Waiting on an owner{" "}
          <span className="text-muted-foreground">({waiting.length})</span>
        </h2>
        <Card className="mt-4 px-5 py-4">
          {waiting.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nothing is waiting. Every request has an answer.
            </p>
          ) : (
            <ul className="divide-y">
              {waiting.map((request) => (
                <li key={request.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/p/${request.property.slug}`}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 hover:underline"
                  >
                    <span className="font-medium text-sm">
                      {request.guest.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {dayRangeLabel(request.checkIn, request.checkOut)}
                    </span>
                    <span className="ml-auto text-muted-foreground text-xs">
                      {request.property.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="mt-10 mb-4">
        <h2 className="font-medium text-sm">
          Places{" "}
          <span className="text-muted-foreground">({properties.length})</span>
        </h2>
        <Card className="mt-4 px-5 py-4">
          <ul className="divide-y">
            {properties.map((property) => (
              <li key={property.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Link
                    href={`/p/${property.slug}`}
                    className="font-medium text-sm hover:underline"
                  >
                    {property.title}
                  </Link>
                  <span className="text-muted-foreground text-xs">
                    {property.owner.name} · {property._count.reservations} on
                    the calendar
                  </span>
                  <Badge
                    variant={property.isBookable ? "default" : "secondary"}
                    className="ml-auto"
                  >
                    {property.isBookable ? "Taking requests" : "Closed"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  )
}
