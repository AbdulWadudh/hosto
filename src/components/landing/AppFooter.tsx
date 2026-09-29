import Link from "next/link"
import { config } from "@/config"

export function AppFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-6 py-6 text-muted-foreground text-xs">
        <span>
          © {new Date().getFullYear()} {config.site.legal.entity}
        </span>
        <span className="flex items-center gap-4">
          <Link
            href="/terms"
            className="transition-colors hover:text-foreground"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="transition-colors hover:text-foreground"
          >
            Privacy
          </Link>
        </span>
      </div>
    </footer>
  )
}
