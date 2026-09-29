const required = (name: string): string => {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        "Set it in .env locally, or in the deployment's environment settings."
    )
  }
  return value
}

const optional = (name: string): string | undefined =>
  process.env[name]?.trim() || undefined

const resendApiKey = optional("RESEND_API_KEY")
const emailFrom = optional("EMAIL_FROM")

if (Boolean(resendApiKey) !== Boolean(emailFrom)) {
  throw new Error(
    "RESEND_API_KEY and EMAIL_FROM must be set together. " +
      "Leave both empty to run without notification emails."
  )
}

const googleClientId = optional("GOOGLE_CLIENT_ID")
const googleClientSecret = optional("GOOGLE_CLIENT_SECRET")

if (Boolean(googleClientId) !== Boolean(googleClientSecret)) {
  throw new Error(
    "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set together. " +
      "Leave both empty to disable Google sign-in."
  )
}

export const env = {
  s3: {
    endpoint: required("S3_ENDPOINT"),
    region: required("S3_REGION"),
    bucket: required("S3_BUCKET"),
    accessKeyId: required("S3_ACCESS_KEY_ID"),
    secretAccessKey: required("S3_SECRET_ACCESS_KEY"),
  },
  databaseUrl: required("DATABASE_URL"),
  email:
    resendApiKey && emailFrom
      ? { apiKey: resendApiKey, from: emailFrom }
      : undefined,
  authSecret: required("BETTER_AUTH_SECRET"),
  google:
    googleClientId && googleClientSecret
      ? { clientId: googleClientId, clientSecret: googleClientSecret }
      : undefined,
}
