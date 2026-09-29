"use client"

import Google from "@thesvg/react/google"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function GoogleButton({
  label,
  onError,
}: {
  label: string
  onError: (message: string) => void
}) {
  const [isRedirecting, setIsRedirecting] = useState(false)

  const signIn = async () => {
    setIsRedirecting(true)
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    })
    if (error) {
      setIsRedirecting(false)
      onError(error.message ?? "Google sign-in is unavailable right now.")
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      disabled={isRedirecting}
      onClick={signIn}
      className="h-11 w-full text-base"
    >
      <Google aria-hidden className="size-4" />
      {isRedirecting ? "Redirecting..." : label}
    </Button>
  )
}
