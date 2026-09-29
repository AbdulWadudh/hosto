import type { Metadata } from "next"
import { PropertyForm } from "@/components/dashboard/PropertyForm"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = { title: "Add a property" }

export default async function NewPropertyPage() {
  await requireSession()

  return (
    <div className="mx-auto w-full max-w-2xl px-6">
      <h1 className="font-heading font-semibold text-3xl tracking-[-0.02em]">
        Add a property
      </h1>
      <p className="mt-2 text-muted-foreground">
        Everything here can be changed later.
      </p>
      <div className="mt-8">
        <PropertyForm />
      </div>
    </div>
  )
}
