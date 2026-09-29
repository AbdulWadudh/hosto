import { Suspense } from "react"
import {
  landingLinks,
  NavUser,
  NavUserFallback,
  SiteFooter,
  SiteNav,
} from "@/components/landing"

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav links={landingLinks}>
        <Suspense fallback={<NavUserFallback />}>
          <NavUser />
        </Suspense>
      </SiteNav>
      <main className="w-full max-w-full flex-1 overflow-x-hidden">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
