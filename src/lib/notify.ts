import "server-only"
import { config } from "@/config"
import { env } from "@/config/env"
import { dayRangeLabel } from "@/lib/calendar/month"

type Letter = {
  to: string
  subject: string
  lines: string[]
  link: string
}

async function send(letter: Letter): Promise<void> {
  const body = [...letter.lines, "", `${config.site.url}${letter.link}`].join(
    "\n"
  )

  if (!env.email) {
    console.info(
      `[notify] no mail configured, skipping "${letter.subject}" to ${letter.to}`
    )
    return
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.email.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.email.from,
      to: letter.to,
      subject: letter.subject,
      text: body,
    }),
  })

  if (!response.ok) {
    throw new Error(
      `Resend refused the message (${response.status}): ${await response.text()}`
    )
  }
}

export async function notify(letter: Letter): Promise<void> {
  try {
    await send(letter)
  } catch (failure) {
    console.error(
      `[notify] could not send "${letter.subject}" to ${letter.to}:`,
      failure
    )
  }
}

type Stay = {
  checkIn: Date
  checkOut: Date
  propertyTitle: string
  propertySlug: string
}

export function requestArrived(
  ownerEmail: string,
  guestName: string,
  stay: Stay,
  note: string | null
): Promise<void> {
  return notify({
    to: ownerEmail,
    subject: `${guestName} asked for ${dayRangeLabel(stay.checkIn, stay.checkOut)} at ${stay.propertyTitle}`,
    lines: [
      `${guestName} would like ${dayRangeLabel(stay.checkIn, stay.checkOut)} at ${stay.propertyTitle}.`,
      ...(note ? ["", `They wrote: ${note}`] : []),
      "",
      "Nothing is held until you approve it.",
    ],
    link: `/p/${stay.propertySlug}`,
  })
}

export function decisionMade(
  guestEmail: string,
  approved: boolean,
  stay: Stay
): Promise<void> {
  const dates = dayRangeLabel(stay.checkIn, stay.checkOut)
  return notify({
    to: guestEmail,
    subject: approved
      ? `${stay.propertyTitle} is yours for ${dates}`
      : `${stay.propertyTitle} is not available for ${dates}`,
    lines: approved
      ? [`The owner approved ${dates} at ${stay.propertyTitle}. It is held.`]
      : [
          `The owner turned down ${dates} at ${stay.propertyTitle}.`,
          "The dates are open to everyone again.",
        ],
    link: `/p/${stay.propertySlug}`,
  })
}

export function stayCancelled(
  ownerEmail: string,
  guestName: string,
  stay: Stay,
  reason: string | null
): Promise<void> {
  const dates = dayRangeLabel(stay.checkIn, stay.checkOut)
  return notify({
    to: ownerEmail,
    subject: `${guestName} cancelled ${dates} at ${stay.propertyTitle}`,
    lines: [
      `${guestName} cancelled ${dates} at ${stay.propertyTitle}. The dates are open again.`,
      ...(reason ? ["", `They wrote: ${reason}`] : []),
    ],
    link: `/p/${stay.propertySlug}`,
  })
}
