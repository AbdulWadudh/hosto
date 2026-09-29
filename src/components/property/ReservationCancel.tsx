"use client"

import { Cancel01Icon, DeleteThrowIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  type CancelState,
  cancelReservation,
} from "@/lib/properties/cancelReservation"

export const cancelFormId = "cancel-reservation"

export function CancelFields({
  reservationId,
  isPendingRequest,
}: {
  reservationId: string
  isPendingRequest: boolean
}) {
  const [state, action] = useActionState<CancelState, FormData>(
    cancelReservation,
    { error: null }
  )

  return (
    <form id={cancelFormId} action={action} className="space-y-3">
      <input type="hidden" name="reservationId" value={reservationId} />

      <p className="font-medium text-sm">
        {isPendingRequest
          ? "Withdraw this request?"
          : "Cancel this booking? The dates go back to everyone else."}
      </p>

      <div className="space-y-2">
        <Label htmlFor="reason">Tell the owner why (optional)</Label>
        <Textarea
          id="reason"
          name="reason"
          rows={3}
          maxLength={500}
          placeholder="Plans changed, sorry for the short notice."
        />
      </div>

      {state.error && (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      )}
    </form>
  )
}

export function CancelActions({
  isPendingRequest,
  onKeep,
}: {
  isPendingRequest: boolean
  onKeep: () => void
}) {
  return (
    <>
      <Button type="button" variant="ghost" onClick={onKeep}>
        <HugeiconsIcon icon={Cancel01Icon} size={14} />
        Keep it
      </Button>
      <Button
        type="submit"
        form={cancelFormId}
        variant="outline"
        className="text-destructive"
      >
        <HugeiconsIcon icon={DeleteThrowIcon} size={14} />
        {isPendingRequest ? "Withdraw" : "Cancel booking"}
      </Button>
    </>
  )
}
