import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <Card className="flex flex-col items-center gap-3 border-dashed bg-muted/20 px-6 py-12 text-center">
      <h3 className="font-heading font-semibold text-lg tracking-tight">
        {title}
      </h3>
      <p className="max-w-sm text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </Card>
  )
}
