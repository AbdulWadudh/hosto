import Link from "next/link"
import { config } from "@/config"

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="relative isolate flex min-h-svh w-full max-w-full flex-col overflow-x-hidden px-6 py-10">
      <span
        aria-hidden
        className="-z-10 absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(75%_100%_at_50%_0%,var(--color-primary)_0%,transparent_65%)] opacity-[0.14]"
      />
      <div className="flex flex-1 items-center justify-center">{children}</div>
      <footer className="mt-10 text-center text-muted-foreground text-xs">
        <Link href="/terms" className="transition-colors hover:text-foreground">
          Terms
        </Link>
        <span className="px-2 opacity-40">·</span>
        <Link
          href="/privacy"
          className="transition-colors hover:text-foreground"
        >
          Privacy
        </Link>
        <span className="px-2 opacity-40">·</span>
        <span>{config.site.legal.entity}</span>
      </footer>
    </main>
  )
}
