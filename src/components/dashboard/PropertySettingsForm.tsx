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
import {
  updatePropertySettings,
  type UpdatePropertyState,
} from "@/lib/properties/updateProperty"

const bufferOptions = [
  { minutes: 45, label: "45 minutes" },
  { minutes: 120, label: "2 hours" },
  { minutes: 240, label: "4 hours" },
  { minutes: 720, label: "12 hours" },
  { minutes: 1440, label: "A full day" },
  { minutes: 2880, label: "Two days" },
]

export type PropertySettings = {
  id: string
  slug: string
  turnoverBufferMinutes: number
  showReserverIdentity: boolean
  isBookable: boolean
  pricingEnabled: boolean
  nightlyPrice: string | null
  currency: string
}

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
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-t py-4 first:border-t-0 first:pt-0">
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

export function PropertySettingsForm({
  property,
}: {
  property: PropertySettings
}) {
  const [state, action, isPending] = useActionState<
    UpdatePropertyState,
    FormData
  >(updatePropertySettings, { error: null, saved: false })
  const [isPricingEnabled, setIsPricingEnabled] = useState(
    property.pricingEnabled
  )
  const bufferId = useId()

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="id" value={property.id} />

      <Card className="px-6 py-5">
        <SettingRow
          label="Taking requests"
          hint="Off keeps the page visible but nobody can ask for dates."
          control={(labelId) => (
            <Switch
              name="isBookable"
              aria-labelledby={labelId}
              defaultChecked={property.isBookable}
            />
          )}
        />

        <SettingRow
          label="Turnover window"
          hint="Applies to requests made from now on. Existing bookings keep theirs."
          control={(labelId) => (
            <Select
              name="turnoverBufferMinutes"
              defaultValue={String(property.turnoverBufferMinutes)}
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
            <Switch
              name="showReserverIdentity"
              aria-labelledby={labelId}
              defaultChecked={property.showReserverIdentity}
            />
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
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="nightlyPrice">Nightly price</Label>
            <div className="flex items-center gap-2">
              <span className="rounded-(--radius-md) border bg-muted/40 px-2.5 py-1.5 font-mono text-muted-foreground text-xs">
                {property.currency}
              </span>
              <Input
                id="nightlyPrice"
                name="nightlyPrice"
                type="number"
                min={1}
                step="0.01"
                required
                defaultValue={property.nightlyPrice ?? ""}
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
      {state.saved && !state.error && (
        <p role="status" className="text-primary text-sm">
          Saved.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="h-11 px-5"
        >
          {isPending ? "Saving..." : "Save changes"}
        </Button>
        <Button
          render={<Link href={`/p/${property.slug}`} />}
          nativeButton={false}
          variant="ghost"
          size="lg"
          className="h-11 px-5"
        >
          View public page
        </Button>
      </div>
    </form>
  )
}
