import { redirectIfSignedIn } from "@/lib/session"
import {
  ClosingCta,
  FeatureBento,
  Hero,
  ScrollReveal,
  TrustMarquee,
  TurnoverAccordion,
} from "@/components/landing"

export default async function HomePage() {
  await redirectIfSignedIn()

  return (
    <>
      <Hero />
      <TrustMarquee />
      <FeatureBento />
      <ScrollReveal />
      <TurnoverAccordion />
      <ClosingCta />
    </>
  )
}
