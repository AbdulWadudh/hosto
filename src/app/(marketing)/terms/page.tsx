import type { Metadata } from "next"
import { termsSections } from "@/app/(marketing)/terms/content"
import { LegalPage } from "@/components/legal"
import { config } from "@/config"

export const metadata: Metadata = {
  title: `Terms of Service · ${config.site.name}`,
  description: `The terms under which ${config.site.name} may be used.`,
}

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      summary={`The agreement between you and ${config.site.legal.entity} covering accounts, estate listings, turnover buffers and reserver privacy.`}
      effectiveDate={config.site.legal.effectiveDate}
      sections={termsSections}
    />
  )
}
