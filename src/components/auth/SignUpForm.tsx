"use client"

import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"
import { AuthError } from "@/components/auth/AuthError"
import { GoogleButton } from "@/components/auth/GoogleButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { config } from "@/config"
import { authClient } from "@/lib/auth-client"

export function SignUpForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const form = new FormData(event.currentTarget)
    const { error: failure } = await authClient.signUp.email({
      name: String(form.get("name")).trim(),
      email: String(form.get("email")),
      password: String(form.get("password")),
    })

    if (failure) {
      setIsSubmitting(false)
      setError(
        failure.message ?? "We could not create your account. Try again."
      )
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
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            placeholder="Meera Krishnan"
            className="h-11"
          />
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={config.auth.minPasswordLength}
            className="h-11"
          />
          <p className="text-muted-foreground text-xs">
            At least {config.auth.minPasswordLength} characters.
          </p>
        </div>

        <AuthError message={error} />

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-11 w-full text-base"
        >
          {isSubmitting ? "Creating your account..." : "Create account"}
        </Button>
      </form>
    </div>
  )
}
