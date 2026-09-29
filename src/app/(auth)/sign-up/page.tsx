import type { Metadata } from "next"
import { AuthShell, SignUpForm } from "@/components/auth"
import { redirectIfSignedIn } from "@/lib/session"

export const metadata: Metadata = { title: "Create an account" }

export default async function SignUpPage() {
  await redirectIfSignedIn()

  return (
    <AuthShell
      title="Create an account"
      subtitle="Ask for the dates you want, or open your own place up to requests."
      footerPrompt="Already have one?"
      footerHref="/sign-in"
      footerLabel="Sign in"
    >
      <SignUpForm />
    </AuthShell>
  )
}
