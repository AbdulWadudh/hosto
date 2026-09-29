import type { Metadata } from "next"
import { AuthShell, SignInForm } from "@/components/auth"
import { redirectIfSignedIn } from "@/lib/session"

export const metadata: Metadata = { title: "Sign in" }

export default async function SignInPage() {
  await redirectIfSignedIn()

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to see your calendar and the requests waiting on you."
      footerPrompt="New here?"
      footerHref="/sign-up"
      footerLabel="Create an account"
    >
      <SignInForm />
    </AuthShell>
  )
}
