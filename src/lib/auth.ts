import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin } from "better-auth/plugins"
import { config } from "@/config"
import { prisma } from "@/lib/prisma"

export const auth = betterAuth({
  basePath: config.auth.basePath,
  baseURL: {
    allowedHosts: [...config.auth.allowedHosts],
    protocol: process.env.NODE_ENV === "production" ? "https" : "http",
  },
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: config.auth.minPasswordLength,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [admin()],
})
