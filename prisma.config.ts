import { expand } from "dotenv-expand"
import { defineConfig, env } from "prisma/config"

const envFilePath = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development"

process.loadEnvFile(envFilePath)
expand({
  parsed: Object.fromEntries(
    Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined),
  ),
})

export default defineConfig({
  schema: "src/core/prisma/schema.prisma",
  migrations: { path: "src/core/prisma/migrations" },
  datasource: { url: env("DB_URL") },
})
