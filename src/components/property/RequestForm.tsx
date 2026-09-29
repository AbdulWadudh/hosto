"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  requestDates,
  type RequestDatesState,
} from "@/lib/properties/requestDates"

export function RequestForm({
  slug,
  title,
  maxGuests,
}: {
  slug: string
  title: string
  maxGuests: number
}) {
  const [state, action, isPending] = useActionState<
    RequestDatesState,
    FormData
  >(requestDates, { error: null })

  const earliest = new Date().toISOString().slice(0, 10)

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="slug" value={slug} />

      <Card className="space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="checkIn">Arriving</Label>
            <Input
              id="checkIn"
              name="checkIn"
              type="date"
              required
              min={earliest}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkOut">Leaving</Label>
            <Input
              id="checkOut"
              name="checkOut"
              type="date"
              required
              min={earliest}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Anything the owner should know</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={500}
            placeholder={`Two of us, arriving late. ${title} sleeps ${maxGuests}.`}
          />
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed">
          Asking costs nothing and holds nothing. The owner sees your request
          and decides; the dates stay open to everyone until they approve it.
        </p>
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
          {isPending ? "Sending..." : "Send request"}
        </Button>
        <Button
          render={<Link href={`/p/${slug}`} />}
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
