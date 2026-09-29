import { Suspense } from "react"
import {
  AppFooter,
  NavUser,
  NavUserFallback,
  SiteNav,
} from "@/components/landing"

export default function PublicPropertyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav>
        <Suspense fallback={<NavUserFallback />}>
          <NavUser />
        </Suspense>
      </SiteNav>
      <main className="w-full max-w-full flex-1 overflow-x-hidden pt-28 pb-20">
        {children}
      </main>
      <AppFooter />
    </div>
  )
}
