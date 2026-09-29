import Link from "next/link"
import { UserMenu } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/session"

export async function NavUser() {
  const session = await getSession()

  if (!session) {
    return (
      <Button
        render={<Link href="/sign-in" />}
        nativeButton={false}
        size="sm"
        className="rounded-(--radius-4xl)"
      >
        Sign in
      </Button>
    )
  }

  return <UserMenu user={session.user} />
}

export function NavUserFallback() {
  return (
    <span
      aria-hidden
      className="block h-7 w-20 rounded-(--radius-4xl) bg-muted/60"
    />
  )
}
