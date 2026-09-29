export type DayState = {
  key: string
  date: Date
  day: number
  inMonth: boolean
  isToday: boolean
  isPast: boolean
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

export function rangeHasConflict(from: Date, to: Date, spans: Span[]): boolean {
  const end = addDays(startOfDay(to), 1)
  const start = startOfDay(from)
  return spans.some(
    (span) =>
      span.status !== "PENDING" &&
      span.checkIn < end &&
      span.blockedUntil > start
  )
}

export function atTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number)
  const copy = new Date(date)
  copy.setHours(hours ?? 0, minutes ?? 0, 0, 0)
  return copy
}

export function describeDuration(milliseconds: number): string {
  const totalHours = Math.round(milliseconds / (60 * 60 * 1000))
  if (totalHours < 24) {
    return `${totalHours} hour${totalHours === 1 ? "" : "s"}`
  }
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  const dayPart = `${days} day${days === 1 ? "" : "s"}`
  return hours === 0
    ? dayPart
    : `${dayPart} ${hours} hour${hours === 1 ? "" : "s"}`
}

export function nightsBetween(from: Date, to: Date): number {
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / dayMs))
}

export function toDateInput(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

function overlapsDay(from: Date, to: Date, day: Date): boolean {
  const next = addDays(day, 1)
  return from < next && to > day
}

function occupiesNight(checkIn: Date, checkOut: Date, day: Date): boolean {
  return startOfDay(checkIn) <= day && day < startOfDay(checkOut)
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
      occupiesNight(span.checkIn, span.checkOut, date)
    )
    const inBuffer = confirmed.some(
      (span) =>
        !occupiesNight(span.checkIn, span.checkOut, date) &&
        overlapsDay(span.checkOut, span.blockedUntil, date)
    )
    const pending = pendingSpans.some((span) =>
      occupiesNight(span.checkIn, span.checkOut, date)
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
      isPast: todayTime !== null && date.getTime() < todayTime,
      occupied,
      inBuffer,
      pending,
      isArrival,
      isDeparture,
    }
  })
}
