"use client"

import { motion, useReducedMotion } from "motion/react"
import { Card } from "@/components/ui/card"

const buffers = ["45 minutes", "4 hours", "A full day", "Two days"]

const dottedWeek = Array.from({ length: 7 }, (_, index) => ({
  id: `cell-${index}`,
  filled: index >= 2 && index <= 5,
}))

export function FeatureBento() {
  const reduced = useReducedMotion()

  const enter = (delay: number) => ({
    initial: reduced ? false : { y: 32, opacity: 0 },
    whileInView: { y: 0, opacity: 1 },
    viewport: { once: true, margin: "-60px" },
    transition: { type: "spring" as const, stiffness: 170, damping: 26, delay },
  })

  return (
    <section
      id="occupancy"
      className="mx-auto w-full max-w-7xl px-6 py-20 md:py-48"
    >
      <h2 className="max-w-4xl font-heading font-semibold text-[clamp(2rem,4vw,3.25rem)] leading-[1.04] tracking-[-0.03em]">
        One house or twenty. Only the parts you need.
      </h2>

      <div className="mt-10 grid md:mt-14 auto-rows-[minmax(11rem,auto)] grid-flow-dense grid-cols-2 gap-4 md:grid-cols-4">
        <motion.div {...enter(0)} className="col-span-2 md:row-span-2">
          <Card className="flex h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/12 via-card to-card p-7">
            <div>
              <h3 className="font-heading font-semibold text-2xl tracking-tight">
                Say how long you need between guests.
              </h3>
              <p className="mt-3 max-w-sm text-muted-foreground text-sm leading-relaxed">
                An hour to change the linen, or two days to repaint between
                seasons. Whatever you choose, nobody can book into it.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {buffers.map((buffer) => (
                <span
                  key={buffer}
                  className="rounded-(--radius-2xl) border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-sm"
                >
                  {buffer}
                </span>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div {...enter(0.08)} className="col-span-2">
          <Card className="flex h-full flex-col justify-between overflow-hidden p-6">
            <h3 className="font-heading font-semibold text-xl tracking-tight">
              A stay reads as one block.
            </h3>
            <div className="my-5 space-y-2.5">
              <div className="grid grid-cols-7 gap-1.5">
                <span className="col-span-2 h-6 rounded-(--radius-2xl) bg-muted" />
                <span className="col-span-4 h-6 rounded-(--radius-2xl) bg-primary" />
                <span className="h-6 rounded-(--radius-2xl) bg-muted" />
              </div>
              <div className="grid grid-cols-7 gap-1.5 opacity-40">
                {dottedWeek.map((cell) => (
                  <span
                    key={cell.id}
                    className="flex h-6 items-center justify-center rounded-(--radius-2xl) bg-muted"
                  >
                    {cell.filled && (
                      <span className="size-1.5 rounded-full bg-foreground" />
                    )}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Four nights is one ribbon across the month, not four disconnected
              dots you have to read twice.
            </p>
          </Card>
        </motion.div>

        <motion.div {...enter(0.16)} className="col-span-2">
          <Card className="flex h-full flex-col justify-between p-6">
            <h3 className="font-heading font-semibold text-xl tracking-tight">
              Requests come in. You decide.
            </h3>
            <div className="mt-5 space-y-2">
              <div className="flex h-8 w-4/5 items-center justify-between rounded-(--radius-2xl) bg-primary px-3 text-primary-foreground text-xs">
                <span>12 - 16 March</span>
                <span>Approved</span>
              </div>
              <div className="flex h-8 w-3/5 items-center justify-between rounded-(--radius-2xl) border border-dashed bg-muted px-3 text-muted-foreground text-xs">
                <span>14 - 18 March</span>
                <span>Waiting</span>
              </div>
            </div>
            <p className="mt-5 text-muted-foreground text-sm leading-relaxed">
              Anyone can ask for any dates. Nothing is held until you say yes -
              and once you do, those nights cannot be given away twice.
            </p>
          </Card>
        </motion.div>

        <motion.div {...enter(0.24)} id="privacy" className="col-span-2">
          <Card className="h-full p-6">
            <h3 className="font-heading font-semibold text-xl tracking-tight">
              Your guests keep their names.
            </h3>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              Leave identity off and anyone looking sees only that the dates are
              taken. No name, no photograph, nothing to piece together.
            </p>
          </Card>
        </motion.div>

        <motion.div {...enter(0.32)} className="col-span-2">
          <Card className="h-full p-6">
            <h3 className="font-heading font-semibold text-xl tracking-tight">
              Switch things on as you grow.
            </h3>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              Start with nothing but dates, for your own use. Add nightly rates,
              guest details and a public page later — or never. Every one of
              them is a switch on the property, not a plan you are stuck with.
            </p>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
