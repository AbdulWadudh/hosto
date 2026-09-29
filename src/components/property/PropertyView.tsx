import {
  Navigation03Icon,
  Settings02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { MonthCalendar } from "@/components/calendar"
import { PropertyGallery } from "@/components/property/PropertyGallery"
import { ReservationList } from "@/components/property/ReservationList"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { describeBuffer, directionsUrl } from "@/components/dashboard"
import type { PropertyDetail } from "@/lib/properties/getProperty"

export function PropertyView({ property }: { property: PropertyDetail }) {
  const now = new Date()
  const spans = property.reservations.map((reservation) => ({
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    blockedUntil: reservation.blockedUntil,
    status: reservation.status,
  }))

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading font-semibold text-[clamp(1.9rem,4vw,2.75rem)] tracking-[-0.02em]">
            {property.title}
          </h1>
          <p className="mt-1.5 text-muted-foreground">{property.address}</p>
        </div>
        {property.isOwner && (
          <Button
            render={<Link href={`/dashboard/properties/${property.id}`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            <HugeiconsIcon icon={Settings02Icon} size={14} />
            Settings
          </Button>
        )}
      </header>

      <div className="mt-6">
        <PropertyGallery images={property.imageUrls} title={property.title} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div className="space-y-8">
          {property.description && (
            <p className="text-muted-foreground leading-relaxed">
              {property.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-(--radius-2xl) border bg-muted/40 px-3 py-1.5">
              <HugeiconsIcon icon={UserGroupIcon} size={14} />
              Sleeps {property.maxGuests}
            </span>
            <span className="rounded-(--radius-2xl) border border-primary/25 bg-primary/10 px-3 py-1.5">
              {describeBuffer(property.turnoverBufferMinutes)}
            </span>
            {property.pricingEnabled && property.nightlyPrice && (
              <span className="rounded-(--radius-2xl) border bg-muted/40 px-3 py-1.5">
                {property.currency} {property.nightlyPrice} a night
              </span>
            )}
            <Button
              render={
                <a
                  href={directionsUrl(property)}
                  target="_blank"
                  rel="noreferrer noopener"
                />
              }
              nativeButton={false}
              variant="outline"
              size="sm"
              className="h-auto py-1.5"
            >
              <HugeiconsIcon icon={Navigation03Icon} size={14} />
              Directions
            </Button>
          </div>

          <Card className="p-5">
            <MonthCalendar
              spans={spans}
              initialYear={now.getFullYear()}
              initialMonth={now.getMonth()}
            />
          </Card>

          <section>
            <h2 className="font-heading font-semibold text-lg tracking-tight">
              Who is staying
            </h2>
            <Card className="mt-3 p-5">
              <ReservationList reservations={property.reservations} />
            </Card>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Card className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading font-semibold tracking-tight">
                Availability
              </h2>
              <Badge variant={property.isBookable ? "default" : "secondary"}>
                {property.isBookable ? "Taking requests" : "Closed"}
              </Badge>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {property.isBookable
                ? "Ask for the nights you want. Nothing is held until the owner approves it."
                : "The owner is not taking requests for this place at the moment."}
            </p>

            {property.isBookable && (
              <Button
                render={<Link href={`/p/${property.slug}/request`} />}
                nativeButton={false}
                size="lg"
                className="h-11 w-full text-base"
              >
                Request dates
              </Button>
            )}

            {!property.showReserverIdentity && (
              <p className="border-t pt-3 text-muted-foreground text-xs leading-relaxed">
                Who is staying is kept private. Booked dates show as reserved
                and nothing more.
              </p>
            )}
          </Card>
        </aside>
      </div>
    </div>
  )
}
