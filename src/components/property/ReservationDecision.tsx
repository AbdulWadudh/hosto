"use client"

import {
  ArrowTurnBackwardIcon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
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
          <HugeiconsIcon
            icon={
              status === "PENDING" ? CancelCircleIcon : ArrowTurnBackwardIcon
            }
            size={14}
          />
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
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
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
