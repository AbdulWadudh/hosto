"use client"

import { motion, useReducedMotion } from "motion/react"
import Link from "next/link"
import { CalendarPreview } from "@/components/landing/CalendarPreview"
import { Button } from "@/components/ui/button"

const rise = {
  hidden: { y: 28, opacity: 0 },
  shown: { y: 0, opacity: 1 },
}

export function Hero() {
  const reduced = useReducedMotion()

  return (
    <section className="relative isolate overflow-hidden pt-32 pb-16 md:pt-52 md:pb-40">
      <div
        aria-hidden
        className="-z-10 absolute inset-0 bg-[radial-gradient(120%_80%_at_15%_-10%,var(--color-primary)_0%,transparent_55%)] opacity-[0.16]"
      />
      <div
        aria-hidden
        className="-z-10 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 md:gap-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <motion.div
          initial={reduced ? false : "hidden"}
          animate="shown"
          transition={{ staggerChildren: 0.09, delayChildren: 0.12 }}
        >
          <motion.h1
            variants={rise}
            transition={{ type: "spring", stiffness: 190, damping: 26 }}
            className="max-w-5xl font-heading font-semibold text-[clamp(2.5rem,4.8vw,4.5rem)] leading-[1] tracking-[-0.035em]"
          >
            Know who's
            <span
              className="mx-3 inline-block h-[0.62em] w-[1.5em] translate-y-[0.04em] rounded-full bg-[url('https://picsum.photos/seed/linenmorning/400/200')] bg-center bg-cover align-middle grayscale-[0.35] contrast-125"
              aria-hidden
            />
            staying, and when.
          </motion.h1>

          <motion.p
            variants={rise}
            transition={{ type: "spring", stiffness: 190, damping: 26 }}
            className="mt-8 max-w-xl text-lg text-muted-foreground leading-relaxed"
          >
            Hosto keeps the calendar for the places you look after. Guests ask
            for the dates they want; you approve, decline, or sit on it. Nothing
            is held until you say yes.
          </motion.p>

          <motion.div
            variants={rise}
            transition={{ type: "spring", stiffness: 190, damping: 26 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Button
              render={<Link href="/sign-in" />}
              nativeButton={false}
              size="lg"
              className="h-11 px-5 text-base"
            >
              Request dates
            </Button>
            <Button
              render={<Link href="#occupancy" />}
              nativeButton={false}
              size="lg"
              variant="outline"
              className="h-11 px-5 text-base"
            >
              See availability
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduced ? false : { y: 48, opacity: 0, rotate: -2 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 140,
            damping: 26,
            delay: 0.3,
          }}
          className="relative lg:-mb-32 lg:translate-x-6"
        >
          <CalendarPreview />
        </motion.div>
      </div>
    </section>
  )
}
