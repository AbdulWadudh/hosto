"use client"

import { motion, useScroll, useTransform } from "motion/react"
import Image from "next/image"
import Link from "next/link"

export const landingLinks = [
  { href: "#occupancy", label: "Calendar" },
  { href: "#turnover", label: "Turnover" },
]

export function SiteNav({
  children,
  links = [],
}: {
  children?: React.ReactNode
  links?: { href: string; label: string }[]
}) {
  const { scrollY } = useScroll()
  const blur = useTransform(scrollY, [0, 120], [6, 18])
  const border = useTransform(
    scrollY,
    [0, 120],
    ["oklch(1 0 0 / 0.06)", "oklch(1 0 0 / 0.14)"]
  )

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.1 }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <motion.nav
        style={{
          backdropFilter: useTransform(blur, (v) => `blur(${v}px)`),
          borderColor: border,
        }}
        className="flex w-full max-w-4xl items-center gap-2 rounded-(--radius-4xl) border bg-background/70 py-2 pr-2 pl-4 shadow-lg shadow-black/5"
      >
        <Link href="/" className="flex items-center gap-2 font-heading">
          <Image
            src="/logo_512x512.png"
            alt=""
            width={26}
            height={26}
            className="rounded-(--radius-sm)"
          />
          <span className="font-semibold tracking-tight">Hosto</span>
        </Link>

        <div className="ml-auto hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-(--radius-2xl) px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto md:ml-2">{children}</div>
      </motion.nav>
    </motion.header>
  )
}
