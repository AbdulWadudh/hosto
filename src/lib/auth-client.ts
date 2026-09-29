import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { config } from "@/config"

export const authClient = createAuthClient({
  basePath: config.auth.basePath,
  plugins: [adminClient()],
})
