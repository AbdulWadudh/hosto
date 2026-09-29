"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import {
  type DecisionState,
  decideReservation,
} from "@/lib/properties/decideReservation"

export function ReservationDecision({
  reservationId,
  status,
}: {
  reservationId: string
  status: string
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

      {status !== "REJECTED" && (
        <Button
          type="submit"
          name="decision"
          value="reject"
          variant="outline"
          disabled={isSaving}
          className="text-destructive"
        >
          {status === "PENDING" ? "Reject" : "Revoke"}
        </Button>
      )}

      {status !== "CONFIRMED" && (
        <Button
          type="submit"
          name="decision"
          value="approve"
          disabled={isSaving}
        >
          {isSaving
            ? "Saving..."
            : status === "REJECTED"
              ? "Approve after all"
              : "Approve"}
        </Button>
      )}
    </form>
  )
}
