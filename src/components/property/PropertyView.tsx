import {
  Navigation03Icon,
  Settings02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import Link from "next/link"
import { describeBuffer, directionsUrl } from "@/components/dashboard"
import { AvailabilityBooking } from "@/components/property/AvailabilityBooking"
import { PropertyGallery } from "@/components/property/PropertyGallery"
import { ReservationList } from "@/components/property/ReservationList"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { PropertyDetail } from "@/lib/properties/getProperty"

export function PropertyView({
  property,
  isSignedIn,
}: {
  property: PropertyDetail
  isSignedIn: boolean
}) {
  const now = new Date()
  const spans = property.reservations.map((reservation) => ({
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    blockedUntil: reservation.blockedUntil,
    status: reservation.status,
  }))

  const canBook = isSignedIn && (property.isBookable || property.isOwner)
  const cover = property.imageUrls[0] ?? null

  return (
    <div className="relative isolate">
      {cover && (
        <div
          aria-hidden
          className="-z-10 -top-28 pointer-events-none absolute inset-x-0 h-[22rem] overflow-hidden"
        >
          <Image
            src={cover}
            alt=""
            fill
            sizes="100vw"
            priority
            className="scale-105 object-cover opacity-25 blur-[2px]"
          />
          <span className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/80 via-65% to-background" />
        </div>
      )}

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

        <div className="mt-5 flex flex-wrap gap-2 text-sm">
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

        {property.description && (
          <p className="mt-5 max-w-2xl text-muted-foreground leading-relaxed">
            {property.description}
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <AvailabilityBooking
            slug={property.slug}
            spans={spans}
            initialYear={now.getFullYear()}
            initialMonth={now.getMonth()}
            canBook={canBook}
            isOwner={property.isOwner}
          />

          <aside className="space-y-4">
            <Card className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-heading font-semibold tracking-tight">
                  Availability
                </h2>
                <Badge variant={property.isBookable ? "default" : "secondary"}>
                  {property.isBookable ? "Taking requests" : "Closed"}
                </Badge>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed">
                {!property.isBookable && property.isOwner
                  ? "Closed to requests. You can still block dates for yourself."
                  : property.isBookable
                    ? "Pick your nights on the calendar. Nothing is held until the owner approves."
                    : "The owner is not taking requests for this place at the moment."}
              </p>

              {!isSignedIn && property.isBookable && (
                <Button
                  render={<Link href="/sign-in" />}
                  nativeButton={false}
                  className="w-full"
                >
                  Sign in to request dates
                </Button>
              )}

              {!property.showReserverIdentity && (
                <p className="border-t pt-3 text-muted-foreground text-xs leading-relaxed">
                  Who is staying is kept private. Booked dates show as reserved
                  and nothing more.
                </p>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="font-heading font-semibold tracking-tight">
                Who is staying
              </h2>
              <div className="mt-3">
                <ReservationList reservations={property.reservations} />
              </div>
            </Card>
          </aside>
        </div>

        <section className="mt-10">
          <h2 className="font-heading font-semibold text-lg tracking-tight">
            Photographs
          </h2>
          <div className="mt-4">
            <PropertyGallery
              images={property.imageUrls}
              title={property.title}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
