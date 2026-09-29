"use client"

import { importLibrary, setOptions } from "@googlemaps/js-api-loader"
import { Location01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type SelectedPlace = {
  address: string
  latitude: number | null
  longitude: number | null
  placeId: string | null
}

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export function PlacePicker() {
  const host = useRef<HTMLDivElement>(null)
  const [place, setPlace] = useState<SelectedPlace | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!apiKey || !host.current) {
      return
    }

    const container = host.current
    let element: HTMLElement | null = null
    let cancelled = false

    const mount = async () => {
      try {
        setOptions({ key: apiKey, v: "weekly" })
        const places = await importLibrary("places")
        if (cancelled) {
          return
        }

        const autocomplete = new places.PlaceAutocompleteElement()
        autocomplete.style.width = "100%"
        element = autocomplete as unknown as HTMLElement
        container.replaceChildren(element)

        autocomplete.addEventListener("gmp-select", async (event: Event) => {
          const { placePrediction } =
            event as unknown as google.maps.places.PlacePredictionSelectEvent
          const selected = placePrediction.toPlace()
          await selected.fetchFields({
            fields: ["formattedAddress", "location", "id"],
          })

          setPlace({
            address: selected.formattedAddress ?? "",
            latitude: selected.location?.lat() ?? null,
            longitude: selected.location?.lng() ?? null,
            placeId: selected.id ?? null,
          })
        })
      } catch {
        if (!cancelled) {
          setFailed(true)
        }
      }
    }

    void mount()

    return () => {
      cancelled = true
      container.replaceChildren()
    }
  }, [])

  if (!apiKey || failed) {
    return (
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          required
          placeholder="Coonoor, Tamil Nadu"
        />
        <p className="text-muted-foreground text-xs">
          {failed
            ? "Map search could not load, so type the address instead."
            : "Type the address. Map search turns on once a Maps API key is set."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="place-search">Address</Label>
      <div
        id="place-search"
        ref={host}
        className="[&_gmp-place-autocomplete]:w-full [&_input]:h-9 [&_input]:w-full [&_input]:rounded-(--radius-md) [&_input]:border [&_input]:bg-transparent [&_input]:px-3 [&_input]:text-sm"
      />
      <input type="hidden" name="address" value={place?.address ?? ""} />
      <input
        type="hidden"
        name="latitude"
        value={place?.latitude?.toString() ?? ""}
      />
      <input
        type="hidden"
        name="longitude"
        value={place?.longitude?.toString() ?? ""}
      />
      <input type="hidden" name="placeId" value={place?.placeId ?? ""} />

      {place ? (
        <p className="flex items-start gap-1.5 text-muted-foreground text-xs">
          <HugeiconsIcon
            icon={Location01Icon}
            size={13}
            className="mt-px shrink-0 text-primary"
          />
          <span>
            {place.address}
            {place.latitude !== null && place.longitude !== null && (
              <span className="ml-1.5 font-mono opacity-70">
                {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
              </span>
            )}
          </span>
        </p>
      ) : (
        <p className="text-muted-foreground text-xs">
          Search for the place so guests can get directions to it.
        </p>
      )}
    </div>
  )
}
