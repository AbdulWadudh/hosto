import "dotenv/config"
import { defineConfig } from "prisma/config"

const migrationUrl =
  process.env.DIRECT_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim()

if (!migrationUrl) {
  throw new Error(
    "Missing required environment variable: DATABASE_URL. " +
      "Set it in .env locally, or in the deployment's environment settings."
  )
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: migrationUrl },
})
