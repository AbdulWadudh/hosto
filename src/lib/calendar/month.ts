export type DayState = {
  key: string
  date: Date
  day: number
  inMonth: boolean
  isToday: boolean
  occupied: boolean
  inBuffer: boolean
  pending: boolean
  isArrival: boolean
  isDeparture: boolean
}

export type Span = {
  checkIn: Date
  checkOut: Date
  blockedUntil: Date
  status: string
}

const dayMs = 24 * 60 * 60 * 1000

export function startOfDay(value: Date): Date {
  const copy = new Date(value)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function addDays(value: Date, amount: number): Date {
  return new Date(value.getTime() + amount * dayMs)
}

const labelFormat = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
})

const dayFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export function monthLabel(year: number, month: number): string {
  return labelFormat.format(new Date(year, month, 1))
}

export function dayLabel(date: Date): string {
  return dayFormat.format(date)
}

function overlapsDay(from: Date, to: Date, day: Date): boolean {
  const next = addDays(day, 1)
  return from < next && to > day
}

export function buildMonth(
  year: number,
  month: number,
  spans: Span[],
  today: Date | null
): DayState[] {
  const first = new Date(year, month, 1)
  const leading = (first.getDay() + 6) % 7
  const gridStart = addDays(startOfDay(first), -leading)
  const todayTime = today ? startOfDay(today).getTime() : null

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index)
    const confirmed = spans.filter((span) => span.status !== "PENDING")
    const pendingSpans = spans.filter((span) => span.status === "PENDING")

    const occupied = confirmed.some((span) =>
      overlapsDay(span.checkIn, span.checkOut, date)
    )
    const inBuffer = confirmed.some(
      (span) =>
        !overlapsDay(span.checkIn, span.checkOut, date) &&
        overlapsDay(span.checkOut, span.blockedUntil, date)
    )
    const pending = pendingSpans.some((span) =>
      overlapsDay(span.checkIn, span.blockedUntil, date)
    )

    const next = addDays(date, 1)
    const isArrival = confirmed.some(
      (span) => span.checkIn >= date && span.checkIn < next
    )
    const isDeparture = confirmed.some(
      (span) => span.checkOut > date && span.checkOut <= next
    )

    return {
      key: date.toISOString().slice(0, 10),
      date,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      isToday: todayTime !== null && date.getTime() === todayTime,
      occupied,
      inBuffer,
      pending,
      isArrival,
      isDeparture,
    }
  })
}
