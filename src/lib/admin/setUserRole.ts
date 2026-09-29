"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { requireSession } from "@/lib/session"

export type RoleState = { error: string | null }

export async function setUserRole(
  _previous: RoleState,
  form: FormData
): Promise<RoleState> {
  const { user } = await requireSession()

  if (user.role !== "admin") {
    return { error: "Only an admin can change roles." }
  }

  const userId = String(form.get("userId") ?? "")
  const role = String(form.get("role") ?? "")

  if (role !== "admin" && role !== "user") {
    return { error: "That is not a role." }
  }
  if (userId === user.id) {
    return {
      error:
        "You cannot change your own role. Ask another admin, so nobody locks themselves out.",
    }
  }

  try {
    await auth.api.setRole({
      body: { userId, role },
      headers: await headers(),
    })
  } catch (failure) {
    return {
      error:
        failure instanceof Error
          ? failure.message
          : "Something went wrong changing that role.",
    }
  }

  revalidatePath("/dashboard/admin")
  return { error: null }
}
