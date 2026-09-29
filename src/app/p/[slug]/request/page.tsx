import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { RequestForm } from "@/components/property/RequestForm"
import { getPropertyBySlug } from "@/lib/properties/getProperty"
import { getSession } from "@/lib/session"

export const metadata: Metadata = { title: "Request dates" }

export default async function RequestDatesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [property, session] = await Promise.all([
    getPropertyBySlug(slug),
    getSession(),
  ])

  if (!property) {
    notFound()
  }
  if (!session) {
    redirect(`/sign-in?next=/p/${slug}/request`)
  }
  if (!property.isBookable) {
    redirect(`/p/${slug}`)
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6">
      <h1 className="font-heading font-semibold text-3xl tracking-[-0.02em]">
        Request dates
      </h1>
      <p className="mt-2 text-muted-foreground">
        {property.title} - {property.address}
      </p>
      <div className="mt-8">
        <RequestForm
          slug={property.slug}
          title={property.title}
          maxGuests={property.maxGuests}
        />
      </div>
    </div>
  )
}
