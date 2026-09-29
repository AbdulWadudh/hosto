import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PropertyView } from "@/components/property"
import { getPropertyBySlug } from "@/lib/properties/getProperty"
import { getSession } from "@/lib/session"

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const property = await getPropertyBySlug(slug)

  if (!property) {
    return { title: "Not found" }
  }

  return {
    title: property.title,
    description: property.description.slice(0, 160) || property.address,
  }
}

export default async function PropertyPage({ params }: Params) {
  const { slug } = await params
  const [property, session] = await Promise.all([
    getPropertyBySlug(slug),
    getSession(),
  ])

  if (!property) {
    notFound()
  }

  return <PropertyView property={property} isSignedIn={session !== null} />
}
