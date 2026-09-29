import type { Metadata } from "next"
import { privacySections } from "@/app/(marketing)/privacy/content"
import { LegalPage } from "@/components/legal"
import { config } from "@/config"

export const metadata: Metadata = {
  title: `Privacy Policy · ${config.site.name}`,
  description: `How ${config.site.name} collects, uses and protects personal data.`,
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      summary={`What ${config.site.name} collects, why it is collected, and the limits we place on ourselves. Written to be read rather than skipped.`}
      effectiveDate={config.site.legal.effectiveDate}
      sections={privacySections}
    />
  )
}
