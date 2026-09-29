"use client"

import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const lowest = 1
const highest = 64

export function GuestStepper({ labelId }: { labelId: string }) {
  const [guests, setGuests] = useState(2)

  const step = (by: number) =>
    setGuests((current) => Math.min(highest, Math.max(lowest, current + by)))

  return (
    <div className="flex items-center gap-1 rounded-(--radius-2xl) border p-1">
      <input type="hidden" name="maxGuests" value={guests} />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="One fewer guest"
        disabled={guests <= lowest}
        onClick={() => step(-1)}
      >
        <HugeiconsIcon icon={MinusSignIcon} size={14} />
      </Button>
      <output
        aria-labelledby={labelId}
        aria-live="polite"
        className="w-8 text-center font-medium text-sm tabular-nums"
      >
        {guests}
      </output>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="One more guest"
        disabled={guests >= highest}
        onClick={() => step(1)}
      >
        <HugeiconsIcon icon={PlusSignIcon} size={14} />
      </Button>
    </div>
  )
}
