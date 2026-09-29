import { SiteFooter, SiteNav } from "@/components/landing"

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteNav />
      <main className="w-full max-w-full overflow-x-hidden">{children}</main>
      <SiteFooter />
    </>
  )
}
