"use client"

import Link from "next/link"
import { useActionState, useId, useState } from "react"
import { GuestStepper } from "@/components/dashboard/GuestStepper"
import { PlacePicker } from "@/components/dashboard/PlacePicker"
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

function Section({
  title,
  blurb,
  children,
}: {
  title: string
  blurb: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <span aria-hidden className="h-4 w-1 rounded-full bg-primary" />
        <div>
          <h2 className="font-heading font-semibold tracking-tight">{title}</h2>
          <p className="text-muted-foreground text-xs">{blurb}</p>
        </div>
      </div>
      <Card className="mt-4 p-6">{children}</Card>
    </section>
  )
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
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-t py-4 first:border-t-0 first:pt-0 last:pb-0">
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
    <form action={action} className="space-y-10">
      <Section title="The place" blurb="What it is and where to find it.">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Name</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="The Old Barn"
            />
            <p className="text-muted-foreground text-xs">
              What you call it. Also becomes its web address.
            </p>
          </div>

          <PlacePicker />

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Two bedrooms, a wood stove, and no phone signal."
            />
          </div>
        </div>
      </Section>

      <Section
        title="How it runs"
        blurb="These decide what the calendar will and will not allow."
      >
        <SettingRow
          label="Sleeps"
          hint="Most people who can stay at once."
          control={(labelId) => <GuestStepper labelId={labelId} />}
        />

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
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="nightlyPrice">Nightly price</Label>
            <div className="flex items-center gap-2">
              <span className="rounded-(--radius-md) border bg-muted/40 px-2.5 py-1.5 font-mono text-muted-foreground text-xs">
                INR
              </span>
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
      </Section>

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
