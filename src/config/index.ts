const apiPrefix = "/api/v1"

const hosts = {
  development: "localhost:3000",
  canonical: "hosto.k79.quest",
  vercel: "hosto-k79.vercel.app",
  vercelPreviews: "hosto-k79-*.vercel.app",
} as const

export const config = {
  api: {
    prefix: apiPrefix,
  },
  booking: {
    arrivalChoices: [
      { id: "morning", label: "Morning", time: "09:00" },
      { id: "afternoon", label: "Afternoon", time: "15:00" },
      { id: "evening", label: "Evening", time: "19:00" },
      { id: "night", label: "Night", time: "22:00" },
    ],
    departureChoices: [
      { id: "morning", label: "Morning", time: "11:00" },
      { id: "afternoon", label: "Afternoon", time: "16:00" },
      { id: "evening", label: "Evening", time: "19:00" },
      { id: "night", label: "Night", time: "22:00" },
    ],
    arrival: "15:00",
    departure: "11:00",
    dayVisit: { arrival: "09:00", departure: "22:00" },
  },
  auth: {
    basePath: `${apiPrefix}/auth`,
    minPasswordLength: 8,
    allowedHosts: [
      hosts.development,
      hosts.canonical,
      hosts.vercel,
      hosts.vercelPreviews,
    ],
  },
  site: {
    name: "Hosto",
    description: "Keep track of who is staying at your properties, and when.",
    url: `https://${hosts.canonical}`,
    contact: {
      email: "privacy@k79.quest",
      postal: "K79, Bengaluru, Karnataka, India",
    },
    legal: {
      entity: "K79",
      effectiveDate: "30 September 2026",
      jurisdiction: "Karnataka, India",
    },
  },
} as const
