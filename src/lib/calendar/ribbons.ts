import {
  type DayState,
  holdsDates,
  type Span,
  startOfDay,
} from "@/lib/calendar/month"

export type Ribbon = {
  key: string
  span: Span
  startColumn: number
  endColumn: number
  clippedStart: boolean
  clippedEnd: boolean
  lane: number
}

export function buildWeekRibbons(week: DayState[], spans: Span[]): Ribbon[] {
  const weekStart = week.at(0)?.date
  const weekEnd = week.at(-1)?.date

  if (!weekStart || !weekEnd) {
    return []
  }

  const live = spans.filter(
    (span) => holdsDates(span) || span.status === "PENDING"
  )

  const lastFilledColumn: number[] = []

  return live
    .map((span) => {
      const first = startOfDay(span.checkIn).getTime()
      const last = startOfDay(span.checkOut).getTime()

      let startIndex = -1
      let endIndex = -1

      week.forEach((day, index) => {
        const at = day.date.getTime()
        if (at < first || at > last) {
          return
        }
        if (startIndex === -1) {
          startIndex = index
        }
        endIndex = index
      })

      if (startIndex === -1) {
        return null
      }

      return {
        span,
        startIndex,
        endIndex,
        clippedStart: first < weekStart.getTime(),
        clippedEnd: last > weekEnd.getTime(),
      }
    })
    .filter((found) => found !== null)
    .sort((a, b) => a.startIndex - b.startIndex)
    .map((found) => {
      let lane = 0
      while (
        lastFilledColumn[lane] !== undefined &&
        lastFilledColumn[lane] >= found.startIndex
      ) {
        lane += 1
      }
      lastFilledColumn[lane] = found.endIndex

      return {
        key: `${found.span.id}-${found.startIndex}`,
        span: found.span,
        startColumn: found.startIndex + 1,
        endColumn: found.endIndex + 2,
        clippedStart: found.clippedStart,
        clippedEnd: found.clippedEnd,
        lane,
      }
    })
}
