const apiPrefix = "/api/v1"
const productionHost = "hosto.k79.quest"
const developmentHost = "localhost:3000"

export const config = {
  api: {
    prefix: apiPrefix,
  },
  auth: {
    basePath: `${apiPrefix}/auth`,
    minPasswordLength: 8,
    allowedHosts: [developmentHost, productionHost],
  },
  site: {
    name: "Hosto",
    description: "Keep track of who is staying at your properties, and when.",
    url: `https://${productionHost}`,
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
