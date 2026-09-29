"use client"

import { motion, useReducedMotion } from "motion/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ClosingCta() {
  const reduced = useReducedMotion()

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-20 md:pb-48">
      <motion.div
        initial={reduced ? false : { y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 160, damping: 26 }}
        className="relative isolate overflow-hidden rounded-(--radius-4xl) bg-primary px-7 py-14 text-primary-foreground md:px-16 md:py-28"
      >
        <span
          aria-hidden
          className="-z-10 absolute inset-0 bg-[radial-gradient(85%_120%_at_85%_10%,oklch(1_0_0/0.22)_0%,transparent_60%)]"
        />
        <span
          aria-hidden
          className="-z-10 absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/25 to-transparent"
        />
        <h2 className="max-w-4xl font-heading font-semibold text-[clamp(2.25rem,5vw,4rem)] leading-[1] tracking-[-0.035em]">
          Put every booking in one place.
        </h2>
        <p className="mt-6 max-w-md text-primary-foreground/75 leading-relaxed">
          Ask for the nights you want, or open your own place up to requests.
          Both start in the same spot.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button
            render={<Link href="/sign-in" />}
            nativeButton={false}
            size="lg"
            className="h-11 bg-background px-5 text-base text-foreground hover:bg-background/90"
          >
            Request dates
          </Button>
          <Button
            render={<Link href="/sign-in" />}
            nativeButton={false}
            size="lg"
            variant="ghost"
            className="h-11 px-5 text-base text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          >
            List a property
          </Button>
        </div>
      </motion.div>
    </section>
  )
}
