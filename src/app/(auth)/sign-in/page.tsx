import type { Metadata } from "next"
import { AuthShell, SignInForm } from "@/components/auth"

export const metadata: Metadata = { title: "Sign in" }

export default function SignInPage() {
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
