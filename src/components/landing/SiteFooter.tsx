import Image from "next/image"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { config } from "@/config"

const groups = [
  {
    heading: "Product",
    links: [
      { href: "#occupancy", label: "Calendar" },
      { href: "#turnover", label: "Turnover" },
      { href: "#privacy", label: "Privacy" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-6 py-14 md:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))] md:gap-12 md:py-16">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 font-heading">
            <Image
              src="/logo_512x512.png"
              alt=""
              width={28}
              height={28}
              className="rounded-(--radius-sm)"
            />
            <span className="font-semibold tracking-tight">
              {config.site.name}
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-muted-foreground text-sm leading-relaxed">
            {config.site.description}
          </p>
        </div>

        {groups.map((group) => (
          <div key={group.heading}>
            <h2 className="font-medium text-sm">{group.heading}</h2>
            <ul className="mt-3.5 space-y-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Separator />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-6 font-mono text-muted-foreground text-xs sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {new Date().getFullYear()} {config.site.legal.entity}
        </span>
        <a
          href={`mailto:${config.site.contact.email}`}
          className="transition-colors hover:text-foreground"
        >
          {config.site.contact.email}
        </a>
      </div>
    </footer>
  )
}
