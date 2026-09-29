import { Suspense } from "react"
import {
  NavUser,
  NavUserFallback,
  SiteFooter,
  SiteNav,
} from "@/components/landing"

export default function PublicPropertyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteNav>
        <Suspense fallback={<NavUserFallback />}>
          <NavUser />
        </Suspense>
      </SiteNav>
      <main className="w-full max-w-full overflow-x-hidden pt-28 pb-20">
        {children}
      </main>
      <SiteFooter />
    </>
  )
}
