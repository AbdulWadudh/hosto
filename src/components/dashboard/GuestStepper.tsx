"use client"

import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const lowest = 1
const highest = 200

export function GuestStepper({
  labelId,
  defaultValue = 2,
}: {
  labelId: string
  defaultValue?: number
}) {
  const [guests, setGuests] = useState(String(defaultValue))

  const clamp = (value: number) =>
    Math.min(highest, Math.max(lowest, Math.round(value)))

  const step = (by: number) => {
    const current = Number(guests)
    setGuests(String(clamp((Number.isFinite(current) ? current : 0) + by)))
  }

  const parsed = Number(guests)
  const atLowest = Number.isFinite(parsed) && parsed <= lowest
  const atHighest = Number.isFinite(parsed) && parsed >= highest

  return (
    <div className="flex items-center gap-1 rounded-(--radius-2xl) border p-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="One fewer guest"
        disabled={atLowest}
        onClick={() => step(-1)}
      >
        <HugeiconsIcon icon={MinusSignIcon} size={14} />
      </Button>
      <Input
        name="maxGuests"
        type="number"
        inputMode="numeric"
        aria-labelledby={labelId}
        min={lowest}
        max={highest}
        required
        value={guests}
        onChange={(event) => setGuests(event.target.value)}
        onBlur={() => {
          const value = Number(guests)
          setGuests(String(Number.isFinite(value) ? clamp(value) : lowest))
        }}
        className="h-7 w-16 border-0 bg-transparent px-0 text-center font-medium tabular-nums shadow-none focus-visible:ring-0"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="One more guest"
        disabled={atHighest}
        onClick={() => step(1)}
      >
        <HugeiconsIcon icon={PlusSignIcon} size={14} />
      </Button>
    </div>
  )
}
