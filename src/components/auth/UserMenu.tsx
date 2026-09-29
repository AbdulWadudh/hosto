"use client"

import {
  DashboardSquare01Icon,
  Logout01Icon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Separator } from "@/components/ui/separator"

export type SessionUser = {
  name: string
  email: string
  image?: string | null
  role?: string | null
  createdAt?: Date | string
}

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"

const joinedOn = (value: SessionUser["createdAt"]) => {
  if (!value) {
    return null
  }
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString(undefined, { month: "long", year: "numeric" })
}

export function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const joined = joinedOn(user.createdAt)
  const isAdmin = user.role === "admin"

  const signOut = async () => {
    setIsSigningOut(true)
    const { authClient } = await import("@/lib/auth-client")
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <Link
            href="/dashboard"
            aria-label={`${user.name}. Go to dashboard`}
            className="block rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
        }
      >
        <Avatar className="size-8 border transition-transform hover:scale-105">
          {user.image && <AvatarImage src={user.image} alt="" />}
          <AvatarFallback className="bg-primary/15 font-medium text-[0.7rem] text-primary">
            {initialsOf(user.name)}
          </AvatarFallback>
        </Avatar>
      </HoverCardTrigger>

      <HoverCardContent align="end" className="w-72 p-0">
        <div className="flex items-start gap-3 p-4">
          <Avatar className="size-11 border">
            {user.image && <AvatarImage src={user.image} alt="" />}
            <AvatarFallback className="bg-primary/15 font-medium text-primary text-sm">
              {initialsOf(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading font-semibold tracking-tight">
              {user.name}
            </p>
            <p className="truncate text-muted-foreground text-xs">
              {user.email}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {isAdmin && (
                <span className="inline-flex items-center gap-1 rounded-(--radius-2xl) border border-primary/25 bg-primary/10 px-2 py-0.5 text-[0.65rem] text-primary">
                  <HugeiconsIcon icon={ShieldKeyIcon} size={11} />
                  Admin
                </span>
              )}
              {joined && (
                <span className="text-[0.65rem] text-muted-foreground">
                  Since {joined}
                </span>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex items-center gap-2 p-2">
          <Button
            render={<Link href="/dashboard" />}
            nativeButton={false}
            size="sm"
            className="flex-1"
          >
            <HugeiconsIcon icon={DashboardSquare01Icon} size={14} />
            Dashboard
          </Button>
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
      </HoverCardContent>
    </HoverCard>
  )
}
