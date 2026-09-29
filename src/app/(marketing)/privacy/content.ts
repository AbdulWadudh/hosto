import type { LegalSection } from "@/components/legal"
import { config } from "@/config"

export const privacySections: LegalSection[] = [
  {
    heading: "Who we are",
    body: [
      `${config.site.legal.entity} operates ${config.site.name}, a calendar and availability service for independently owned holiday estates. This policy explains what we collect, why, and what we never do with it. It applies to ${config.site.url} and every service reached from it.`,
      `Questions about anything below go to ${config.site.contact.email}. Postal address: ${config.site.contact.postal}.`,
    ],
  },
  {
    heading: "Information you give us",
    items: [
      "Account details: your name, email address and, if you sign in with Google, your Google profile picture.",
      "Estate details: the title, slug, address, description, photographs, guest capacity, turnover buffer and — where you choose to publish them — nightly rates for each property you list.",
      "Reservation details: check-in and check-out timestamps, booking status, any notes you attach, and the total price where pricing is enabled.",
      "Correspondence: anything you send us by email or through a support form.",
    ],
  },
  {
    heading: "Information collected automatically",
    body: [
      "When you sign in we record the session token, its expiry, the IP address and the user agent of the device used. This is what lets you stay signed in and lets you see and revoke your own active sessions.",
      "We do not run advertising trackers, and we do not sell or share behavioural data with data brokers.",
    ],
  },
  {
    heading: "Google user data",
    body: [
      "If you choose Sign in with Google, we request only your basic profile and email address. We use them for exactly three things: to create and identify your account, to display your name to people you have authorised to see it, and to contact you about your account.",
      `${config.site.name}'s use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements. We do not transfer Google user data to third parties except as required to provide the service, and we do not use it for advertising, resale, or credit assessment. No human at ${config.site.legal.entity} reads your Google data except with your explicit consent, for security investigations, or where required by law.`,
      "You can disconnect Hosto from your Google account at any time from your Google account permissions page. Doing so removes our ability to authenticate you; it does not by itself delete your Hosto account.",
    ],
  },
  {
    heading: "Reserver identity and who can see what",
    body: [
      "Each property carries a reserver identity setting controlled by its owner. When it is switched off, the data we send to anyone who is not an administrator, the property owner, or the reserver themselves contains only dates and an occupied status.",
      "This is enforced on our servers before a response is produced. The name, avatar, email address and notes of a reserver are not sent to an unauthorised viewer in any form — not hidden by styling, not obscured in the page, not present in the underlying payload.",
    ],
  },
  {
    heading: "Why we process your data",
    items: [
      "To provide the service: authenticating you, showing availability, and preventing a property being double-booked.",
      "To honour the visibility choices an estate owner has made, which is a contractual necessity of the service.",
      "To keep accounts secure, investigate abuse, and satisfy our legal obligations.",
      "To contact you about material changes to the service, your account, or this policy.",
    ],
  },
  {
    heading: "Who we share it with",
    body: [
      "We do not sell personal data. We share it only with the infrastructure providers needed to run the service — hosting, the managed database that stores your records, and the object storage that holds property images — each acting on our instructions and bound to protect it.",
      "We may disclose information where the law requires it, or where it is necessary to establish, exercise or defend a legal claim. If we are ever involved in a merger or acquisition, we will give you notice before your data becomes subject to a different policy.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "Account and property records are kept while your account is open. Reservation records are kept for as long as the estate owner needs them for their own accounting, and then deleted.",
      `You can ask us to delete your account and the personal data in it by writing to ${config.site.contact.email}. We will act within thirty days. Some records may be retained longer where we are legally required to keep them, and we will tell you if that applies.`,
    ],
  },
  {
    heading: "Your rights",
    body: [
      "Depending on where you live, you may have the right to access the personal data we hold about you, correct it, delete it, object to or restrict how we use it, and receive a copy in a portable format. Exercise any of these by writing to us; we will not charge you or treat you differently for asking.",
    ],
  },
  {
    heading: "Security",
    body: [
      "Passwords are stored hashed, never in plain text. Connections are encrypted in transit. Access to production data is limited to the people who need it to operate the service.",
      "No system is perfect. If a breach ever affects your personal data, we will notify you and the relevant authority as required by law.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "We set a session cookie when you sign in, and a preference cookie remembering whether you chose the light or dark theme. Both are necessary for the site to work as you expect. We set no advertising or analytics cookies.",
    ],
  },
  {
    heading: "Children",
    body: [
      "Hosto is not directed at children under 16, and we do not knowingly collect their personal data. If you believe a child has given us information, write to us and we will delete it.",
    ],
  },
  {
    heading: "International transfers",
    body: [
      `${config.site.legal.entity} is based in ${config.site.legal.jurisdiction}. Where data is processed outside your country, we rely on appropriate safeguards for that transfer.`,
    ],
  },
  {
    heading: "Changes to this policy",
    body: [
      "If we make a material change we will update the effective date at the top of this page and, where the change affects how we use data you have already given us, contact you directly before it takes effect.",
    ],
  },
]
