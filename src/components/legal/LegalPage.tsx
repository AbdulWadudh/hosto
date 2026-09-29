import { Separator } from "@/components/ui/separator"

export type LegalSection = {
  heading: string
  body?: string[]
  items?: string[]
}

type LegalPageProps = {
  title: string
  summary: string
  effectiveDate: string
  sections: LegalSection[]
}

export function LegalPage({
  title,
  summary,
  effectiveDate,
  sections,
}: LegalPageProps) {
  return (
    <article className="relative isolate mx-auto w-full max-w-3xl px-6 pt-40 pb-32">
      <span
        aria-hidden
        className="-z-10 absolute inset-x-0 top-0 h-80 bg-[radial-gradient(90%_100%_at_50%_0%,var(--color-primary)_0%,transparent_65%)] opacity-[0.12]"
      />

      <p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
        Effective {effectiveDate}
      </p>
      <h1 className="mt-4 font-heading font-semibold text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.02] tracking-[-0.03em]">
        {title}
      </h1>
      <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
        {summary}
      </p>

      <Separator className="my-12" />

      <div className="space-y-12">
        {sections.map((section, index) => (
          <section key={section.heading}>
            <h2 className="flex gap-4 font-heading font-semibold text-xl tracking-tight">
              <span className="pt-0.5 font-mono text-muted-foreground/60 text-sm tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              {section.heading}
            </h2>
            <div className="mt-4 space-y-4 pl-0 sm:pl-10">
              {section.body?.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="text-muted-foreground leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="space-y-2.5">
                  {section.items.map((item) => (
                    <li
                      key={item.slice(0, 48)}
                      className="flex gap-3 text-muted-foreground leading-relaxed"
                    >
                      <span
                        aria-hidden
                        className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}
