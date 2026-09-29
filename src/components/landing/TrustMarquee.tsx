const estates = [
  "Villas",
  "Cabins",
  "Lofts",
  "Farmstays",
  "Houseboats",
  "Cottages",
  "Treehouses",
  "Riads",
]

export function TrustMarquee() {
  return (
    <section
      aria-label="Estate types Hosto is built for"
      className="relative flex overflow-hidden border-y py-6"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent"
      />
      <span
        aria-hidden
        className="absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent"
      />
      {[0, 1].map((track) => (
        <div
          key={track}
          aria-hidden={track === 1}
          className="flex shrink-0 animate-[marquee_38s_linear_infinite] items-center gap-12 pr-12 motion-reduce:animate-none"
        >
          {estates.map((estate) => (
            <span
              key={estate}
              className="font-heading font-medium text-2xl text-muted-foreground/70 tracking-tight md:text-3xl"
            >
              {estate}
            </span>
          ))}
        </div>
      ))}
    </section>
  )
}
