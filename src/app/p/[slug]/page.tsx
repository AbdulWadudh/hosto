import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PropertyView } from "@/components/property"
import { getPropertyBySlug } from "@/lib/properties/getProperty"

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
  const property = await getPropertyBySlug(slug)

  if (!property) {
    notFound()
  }

  return <PropertyView property={property} />
}
