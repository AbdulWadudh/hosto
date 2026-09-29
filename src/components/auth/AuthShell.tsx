"use client"

import { motion, useReducedMotion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

type AuthShellProps = {
  title: string
  subtitle: string
  children: ReactNode
  footerPrompt: string
  footerHref: string
  footerLabel: string
}

export function AuthShell({
  title,
  subtitle,
  children,
  footerPrompt,
  footerHref,
  footerLabel,
}: AuthShellProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 26 }}
      className="w-full max-w-sm"
    >
      <Link
        href="/"
        className="mx-auto flex w-fit items-center gap-2 font-heading"
      >
        <Image
          src="/logo_512x512.png"
          alt=""
          width={30}
          height={30}
          className="rounded-(--radius-sm)"
        />
        <span className="font-semibold text-lg tracking-tight">Hosto</span>
      </Link>

      <h1 className="mt-8 text-center font-heading font-semibold text-3xl tracking-[-0.02em]">
        {title}
      </h1>
      <p className="mt-2 text-center text-muted-foreground text-sm leading-relaxed">
        {subtitle}
      </p>

      <div className="mt-8">{children}</div>

      <p className="mt-8 text-center text-muted-foreground text-sm">
        {footerPrompt}{" "}
        <Link
          href={footerHref}
          className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
        >
          {footerLabel}
        </Link>
      </p>
    </motion.div>
  )
}
