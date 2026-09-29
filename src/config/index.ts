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
