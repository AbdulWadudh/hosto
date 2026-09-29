import {
  ClosingCta,
  FeatureBento,
  Hero,
  ScrollReveal,
  TrustMarquee,
  TurnoverAccordion,
} from "@/components/landing"

export default function HomePage() {
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
