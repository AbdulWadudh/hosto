import { DirectionsIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export type PropertySummary = {
  id: string
  title: string
  address: string
  latitude: number | null
  longitude: number | null
  placeId: string | null
  turnoverBufferMinutes: number
  showReserverIdentity: boolean
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

export function PropertyCard({ property }: { property: PropertySummary }) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-heading font-semibold tracking-tight">
            {property.title}
          </h3>
          <p className="truncate text-muted-foreground text-sm">
            {property.address}
          </p>
        </div>
        {property.pendingRequests > 0 && (
          <Badge className="shrink-0">{property.pendingRequests} waiting</Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-(--radius-2xl) border border-primary/25 bg-primary/10 px-2.5 py-1">
          {describeBuffer(property.turnoverBufferMinutes)}
        </span>
        <span className="rounded-(--radius-2xl) border bg-muted/40 px-2.5 py-1 text-muted-foreground">
          {property.showReserverIdentity ? "Names shown" : "Names hidden"}
        </span>
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
          className="ml-auto text-muted-foreground hover:text-foreground"
        >
          <HugeiconsIcon icon={DirectionsIcon} size={15} />
        </Button>
      </div>
    </Card>
  )
}
