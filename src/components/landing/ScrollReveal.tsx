"use client"

import { type MotionValue, motion, useScroll, useTransform } from "motion/react"
import { useRef } from "react"

const sentence =
  "You should never wake up to two families on the same doorstep. Anyone may ask for any dates. Nothing is held until you say yes, and the moment you do, those nights cannot be promised to anybody else."

function Word({
  children,
  progress,
  range,
}: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
}) {
  const opacity = useTransform(progress, range, [0.14, 1])

  return (
    <motion.span style={{ opacity }} className="mr-[0.26em] inline-block">
      {children}
    </motion.span>
  )
}

const words = sentence.split(" ").map((text, index) => ({
  id: `${index}-${text}`,
  text,
  range: [
    index / sentence.split(" ").length,
    (index + 1) / sentence.split(" ").length,
  ] as [number, number],
}))

export function ScrollReveal() {
  const container = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.9", "start 0.35"],
  })

  return (
    <section className="mx-auto w-full max-w-5xl px-6 pt-2 pb-16 md:py-40">
      <p
        ref={container}
        className="flex flex-wrap font-heading font-medium text-[clamp(1.6rem,3.4vw,2.75rem)] leading-[1.24] tracking-[-0.02em]"
      >
        {words.map((word) => (
          <Word key={word.id} progress={scrollYProgress} range={word.range}>
            {word.text}
          </Word>
        ))}
      </p>
    </section>
  )
}
