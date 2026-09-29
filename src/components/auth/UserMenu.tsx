"use client"

import { Logout01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export type SessionUser = {
  name: string
  email: string
  image?: string | null
}

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"

export function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const signOut = async () => {
    setIsSigningOut(true)
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1.5">
      <span
        aria-hidden
        className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/15 font-medium text-[0.7rem] text-primary"
      >
        {user.image ? (
          // biome-ignore lint/performance/noImgElement: avatar host is not known ahead of time
          <img src={user.image} alt="" className="size-full object-cover" />
        ) : (
          initialsOf(user.name)
        )}
      </span>
      <span className="hidden max-w-32 truncate text-sm sm:inline">
        {user.name}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Sign out"
        title="Sign out"
        disabled={isSigningOut}
        onClick={signOut}
        className="text-muted-foreground hover:text-foreground"
      >
        <HugeiconsIcon icon={Logout01Icon} size={16} />
      </Button>
    </div>
  )
}
