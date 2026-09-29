"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

const stages = [
  {
    id: "arrive",
    title: "Arrive",
    detail: "Check-in opens at the hour you set, never before.",
    seed: "estatearrival",
  },
  {
    id: "stay",
    title: "Stay",
    detail: "The span holds as one block across every month it touches.",
    seed: "estateinterior",
  },
  {
    id: "turn",
    title: "Turn over",
    detail:
      "Linen, keys, a walk-through. The window is yours and it is unbookable.",
    seed: "estatelinen",
  },
  {
    id: "reopen",
    title: "Re-open",
    detail: "The moment the buffer closes, the date is offered again.",
    seed: "estatekeys",
  },
]

export function TurnoverAccordion() {
  const [active, setActive] = useState(stages[2].id)

  return (
    <section
      id="turnover"
      className="mx-auto w-full max-w-7xl px-6 pb-20 md:pb-48"
    >
      <div className="flex flex-col gap-4 md:flex-row md:h-[28rem]">
        {stages.map((stage) => {
          const isActive = stage.id === active

          return (
            <button
              type="button"
              key={stage.id}
              onMouseEnter={() => setActive(stage.id)}
              onFocus={() => setActive(stage.id)}
              onClick={() => setActive(stage.id)}
              aria-expanded={isActive}
              className={cn(
                "group relative overflow-hidden rounded-(--radius-3xl) border text-left transition-[flex-grow] duration-700 ease-out",
                "h-56 md:h-auto",
                isActive ? "md:grow-[4]" : "md:grow"
              )}
            >
              <Image
                src={`https://picsum.photos/seed/${stage.seed}/1200/1600`}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className={cn(
                  "object-cover transition-all duration-700 ease-out",
                  isActive
                    ? "scale-100 grayscale-0"
                    : "scale-105 grayscale opacity-60"
                )}
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-heading font-semibold text-2xl text-white tracking-tight">
                  {stage.title}
                </h3>
                <p
                  className={cn(
                    "mt-2 max-w-sm text-sm text-white/75 leading-relaxed transition-opacity duration-500 max-md:opacity-100",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                >
                  {stage.detail}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
