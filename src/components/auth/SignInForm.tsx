"use client"

import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"
import { AuthError } from "@/components/auth/AuthError"
import { GoogleButton } from "@/components/auth/GoogleButton"
import { PasswordField } from "@/components/auth/PasswordField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"

export function SignInForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const form = new FormData(event.currentTarget)
    const { error: failure } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    })

    if (failure) {
      setIsSubmitting(false)
      setError(failure.message ?? "We could not sign you in. Try again.")
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <GoogleButton label="Continue with Google" onError={setError} />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="h-11"
          />
        </div>

        <PasswordField autoComplete="current-password" />

        <AuthError message={error} />

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-11 w-full text-base"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  )
}
