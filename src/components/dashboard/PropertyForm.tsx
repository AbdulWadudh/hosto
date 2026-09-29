"use client"

import Link from "next/link"
import { useActionState, useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  createProperty,
  type CreatePropertyState,
} from "@/lib/properties/createProperty"

const bufferOptions = [
  { minutes: 45, label: "45 minutes" },
  { minutes: 120, label: "2 hours" },
  { minutes: 240, label: "4 hours" },
  { minutes: 720, label: "12 hours" },
  { minutes: 1440, label: "A full day" },
  { minutes: 2880, label: "Two days" },
]

function SettingRow({
  label,
  hint,
  control,
}: {
  label: string
  hint: string
  control: (labelId: string) => React.ReactNode
}) {
  const labelId = useId()

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-t py-4 first:border-t-0">
      <div className="min-w-0">
        <p id={labelId} className="font-medium text-sm">
          {label}
        </p>
        <p className="mt-0.5 text-muted-foreground text-xs leading-relaxed">
          {hint}
        </p>
      </div>
      {control(labelId)}
    </div>
  )
}

export function PropertyForm() {
  const [state, action, isPending] = useActionState<
    CreatePropertyState,
    FormData
  >(createProperty, { error: null })
  const [isPricingEnabled, setIsPricingEnabled] = useState(false)
  const bufferId = useId()

  return (
    <form action={action} className="space-y-6">
      <Card className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="title">Name</Label>
          <Input id="title" name="title" required placeholder="The Old Barn" />
          <p className="text-muted-foreground text-xs">
            What you call it. Also becomes its web address.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            required
            placeholder="Coonoor, Tamil Nadu"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Two bedrooms, a wood stove, and no phone signal."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxGuests">Sleeps</Label>
          <Input
            id="maxGuests"
            name="maxGuests"
            type="number"
            min={1}
            max={64}
            defaultValue={2}
            required
            className="w-28"
          />
          <p className="text-muted-foreground text-xs">
            Most people who can stay at once.
          </p>
        </div>
      </Card>

      <Card className="px-6 py-2">
        <SettingRow
          label="Turnover window"
          hint="Time you need after a guest leaves. Nobody can be approved into it."
          control={(labelId) => (
            <Select
              name="turnoverBufferMinutes"
              defaultValue="240"
              items={bufferOptions.map((option) => ({
                value: String(option.minutes),
                label: option.label,
              }))}
            >
              <SelectTrigger
                id={bufferId}
                aria-labelledby={labelId}
                className="w-40"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bufferOptions.map((option) => (
                  <SelectItem
                    key={option.minutes}
                    value={String(option.minutes)}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <SettingRow
          label="Show who reserved"
          hint="Off means visitors see only that the dates are taken."
          control={(labelId) => (
            <Switch name="showReserverIdentity" aria-labelledby={labelId} />
          )}
        />

        <SettingRow
          label="Charge for stays"
          hint="Off keeps this a private calendar with no rates at all."
          control={(labelId) => (
            <Switch
              name="pricingEnabled"
              aria-labelledby={labelId}
              checked={isPricingEnabled}
              onCheckedChange={setIsPricingEnabled}
            />
          )}
        />

        {isPricingEnabled && (
          <div className="space-y-2 border-t py-4">
            <Label htmlFor="nightlyPrice">Nightly price</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">INR</span>
              <Input
                id="nightlyPrice"
                name="nightlyPrice"
                type="number"
                min={1}
                step="0.01"
                required
                className="w-40"
              />
            </div>
          </div>
        )}
      </Card>

      {state.error && (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="h-11 px-5"
        >
          {isPending ? "Adding..." : "Add property"}
        </Button>
        <Button
          render={<Link href="/dashboard" />}
          nativeButton={false}
          variant="ghost"
          size="lg"
          className="h-11 px-5"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
