"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import {
  type DecisionState,
  decideReservation,
} from "@/lib/properties/decideReservation"

export function ReservationDecision({
  reservationId,
  isPendingRequest,
}: {
  reservationId: string
  isPendingRequest: boolean
}) {
  const [state, action, isSaving] = useActionState<DecisionState, FormData>(
    decideReservation,
    { error: null }
  )

  return (
    <form
      action={action}
      className="flex flex-wrap items-center justify-end gap-2"
    >
      {state.error && (
        <p role="alert" className="w-full text-destructive text-xs">
          {state.error}
        </p>
      )}

      <input type="hidden" name="reservationId" value={reservationId} />

      <Button
        type="submit"
        name="decision"
        value="reject"
        variant="outline"
        disabled={isSaving}
        className="text-destructive"
      >
        {isPendingRequest ? "Reject" : "Revoke"}
      </Button>

      {isPendingRequest && (
        <Button
          type="submit"
          name="decision"
          value="approve"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Approve"}
        </Button>
      )}
    </form>
  )
}
