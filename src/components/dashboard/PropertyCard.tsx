import {
  Image01Icon,
  Navigation03Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export type PropertySummary = {
  id: string
  slug: string
  title: string
  address: string
  coverUrl: string | null
  latitude: number | null
  longitude: number | null
  placeId: string | null
  turnoverBufferMinutes: number
  showReserverIdentity: boolean
  isBookable: boolean
  pendingRequests: number
}

export function describeBuffer(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min turnover`
  }
  if (minutes < 1440) {
    const hours = minutes / 60
    return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h turnover`
  }
  const days = minutes / 1440
  return `${Number.isInteger(days) ? days : days.toFixed(1)} day turnover`
}

export function directionsUrl(property: {
  address: string
  latitude: number | null
  longitude: number | null
  placeId: string | null
}): string {
  const destination =
    property.latitude !== null && property.longitude !== null
      ? `${property.latitude},${property.longitude}`
      : property.address

  const params = new URLSearchParams({ api: "1", destination })
  if (property.placeId) {
    params.set("destination_place_id", property.placeId)
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export function PropertyCard({
  property,
  manageHref,
}: {
  property: PropertySummary
  manageHref?: string
}) {
  return (
    <Card className="group relative flex flex-col overflow-hidden p-0">
      <Link
        href={`/p/${property.slug}`}
        className="relative block aspect-16/10 w-full overflow-hidden bg-muted"
      >
        {property.coverUrl ? (
          <Image
            src={property.coverUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 45vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground/60">
            <HugeiconsIcon icon={Image01Icon} size={22} />
          </span>
        )}

        <span className="absolute top-2.5 right-2.5 flex gap-1.5">
          {property.pendingRequests > 0 && (
            <Badge>{property.pendingRequests} waiting</Badge>
          )}
          {!property.isBookable && <Badge variant="secondary">Closed</Badge>}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="min-w-0">
          <h3 className="truncate font-heading font-semibold tracking-tight">
            <Link
              href={`/p/${property.slug}`}
              className="outline-none after:absolute after:inset-0 focus-visible:underline"
            >
              {property.title}
            </Link>
          </h3>
          <p className="truncate text-muted-foreground text-sm">
            {property.address}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-(--radius-2xl) border border-primary/25 bg-primary/10 px-2.5 py-1">
            {describeBuffer(property.turnoverBufferMinutes)}
          </span>
          <span className="rounded-(--radius-2xl) border bg-muted/40 px-2.5 py-1 text-muted-foreground">
            {property.showReserverIdentity ? "Names shown" : "Names hidden"}
          </span>

          <span className="relative z-10 ml-auto flex gap-1">
            <Button
              render={
                <a
                  href={directionsUrl(property)}
                  target="_blank"
                  rel="noreferrer noopener"
                />
              }
              nativeButton={false}
              variant="ghost"
              size="icon-sm"
              aria-label={`Directions to ${property.title}`}
              title="Directions from where you are"
              className="text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon icon={Navigation03Icon} size={15} />
            </Button>
            {manageHref && (
              <Button
                render={<Link href={manageHref} />}
                nativeButton={false}
                variant="ghost"
                size="icon-sm"
                aria-label={`Settings for ${property.title}`}
                title="Settings"
                className="text-muted-foreground hover:text-foreground"
              >
                <HugeiconsIcon icon={Settings02Icon} size={15} />
              </Button>
            )}
          </span>
        </div>
      </div>
    </Card>
  )
}
