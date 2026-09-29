"use client"

import { ShieldKeyIcon, UserIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useActionState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type RoleState, setUserRole } from "@/lib/admin/setUserRole"

export type AdminUser = {
  id: string
  name: string
  email: string
  image: string | null
  role: string
  properties: number
  reservations: number
  isYou: boolean
}

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"

export function AdminUserRow({ user }: { user: AdminUser }) {
  const [state, action, isSaving] = useActionState<RoleState, FormData>(
    setUserRole,
    { error: null }
  )
  const isAdmin = user.role === "admin"

  return (
    <li className="flex flex-wrap items-center gap-3 border-t py-3 first:border-t-0 first:pt-0">
      <Avatar className="size-8 border">
        {user.image && <AvatarImage src={user.image} alt="" />}
        <AvatarFallback className="bg-primary/15 font-medium text-[0.65rem] text-primary">
          {initialsOf(user.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm">
          {user.name}
          {user.isYou && (
            <span className="ml-2 text-muted-foreground text-xs">you</span>
          )}
        </p>
        <p className="truncate text-muted-foreground text-xs">{user.email}</p>
        {state.error && (
          <p role="alert" className="mt-1 text-destructive text-xs">
            {state.error}
          </p>
        )}
      </div>

      <span className="text-muted-foreground text-xs">
        {user.properties} owned · {user.reservations} stays
      </span>

      <Badge variant={isAdmin ? "default" : "secondary"}>
        {isAdmin ? "Admin" : "Member"}
      </Badge>

      <form action={action}>
        <input type="hidden" name="userId" value={user.id} />
        <input type="hidden" name="role" value={isAdmin ? "user" : "admin"} />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={isSaving || user.isYou}
          title={
            user.isYou ? "Another admin has to change your own role" : undefined
          }
        >
          <HugeiconsIcon icon={isAdmin ? UserIcon : ShieldKeyIcon} size={14} />
          {isAdmin ? "Make member" : "Make admin"}
        </Button>
      </form>
    </li>
  )
}
