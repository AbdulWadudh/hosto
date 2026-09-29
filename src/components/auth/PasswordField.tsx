"use client"

import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { config } from "@/config"

export function PasswordField({
  autoComplete,
  hasMinimum = false,
}: {
  autoComplete: "current-password" | "new-password"
  hasMinimum?: boolean
}) {
  const [isVisible, setIsVisible] = useState(false)
  const action = isVisible ? "Hide password" : "Show password"

  return (
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={hasMinimum ? config.auth.minPasswordLength : undefined}
          className="h-11 pr-11"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={action}
          aria-pressed={isVisible}
          title={action}
          onClick={() => setIsVisible((visible) => !visible)}
          className="-translate-y-1/2 absolute top-1/2 right-1.5 text-muted-foreground hover:text-foreground"
        >
          <HugeiconsIcon
            icon={isVisible ? ViewOffSlashIcon : ViewIcon}
            size={18}
          />
        </Button>
      </div>
      {hasMinimum && (
        <p className="text-muted-foreground text-xs">
          At least {config.auth.minPasswordLength} characters.
        </p>
      )}
    </div>
  )
}
