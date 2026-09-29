import { config } from "@/config"

const earliestArrival = config.booking.arrivalChoices.reduce(
  (earliest, choice) => (choice.time < earliest ? choice.time : earliest),
  "23:59"
)

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
  isLeavingDay: boolean
  span: Span | null
}

export type Span = {
  id: string
  label: string | null
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

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

export function monthLabel(year: number, month: number): string {
  return labelFormat.format(new Date(year, month, 1))
}

export function dayLabel(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0")
  return `${day}-${monthNames[date.getMonth()]}-${date.getFullYear()}`
}

export function dayRangeLabel(from: Date, to: Date): string {
  const sameYear = from.getFullYear() === to.getFullYear()
  const firstDay = String(from.getDate()).padStart(2, "0")
  const lastDay = String(to.getDate()).padStart(2, "0")

  if (sameYear && from.getMonth() === to.getMonth()) {
    return `${firstDay}-${lastDay} ${monthNames[to.getMonth()]} ${to.getFullYear()}`
  }
  if (sameYear) {
    return `${firstDay} ${monthNames[from.getMonth()]} - ${lastDay} ${monthNames[to.getMonth()]} ${to.getFullYear()}`
  }
  return `${dayLabel(from)} - ${dayLabel(to)}`
}

export function timeOfDay(date: Date): string {
  const hour = date.getHours()
  if (hour < 5) {
    return "Night"
  }
  if (hour < 12) {
    return "Morning"
  }
  if (hour < 17) {
    return "Afternoon"
  }
  if (hour < 21) {
    return "Evening"
  }
  return "Night"
}

export function momentLabel(date: Date): string {
  return `${dayLabel(date)}, ${timeOfDay(date)}`
}

export function holdsDates(span: Span): boolean {
  return span.status === "CONFIRMED" || span.status === "RESERVED"
}

export function rangeHasConflict(from: Date, to: Date, spans: Span[]): boolean {
  const end = addDays(startOfDay(to), 1)
  const start = atTime(from, earliestArrival)
  return spans.some(
    (span) =>
      holdsDates(span) && span.checkIn < end && span.blockedUntil > start
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

export function coversDay(
  span: { checkIn: Date; checkOut: Date },
  day: Date
): boolean {
  return startOfDay(span.checkIn) <= day && day <= startOfDay(span.checkOut)
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

export function occupiesNight(
  checkIn: Date,
  checkOut: Date,
  day: Date
): boolean {
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

  const live = spans.filter(
    (span) => holdsDates(span) || span.status === "PENDING"
  )
  const confirmed = live.filter(holdsDates)
  const isDayVisit = (span: Span) =>
    startOfDay(span.checkIn).getTime() === startOfDay(span.checkOut).getTime()
  const holdsNight = (span: Span, day: Date) =>
    isDayVisit(span)
      ? startOfDay(span.checkIn).getTime() === day.getTime()
      : occupiesNight(span.checkIn, span.checkOut, day)
  const leaves = (span: Span, day: Date) =>
    !isDayVisit(span) && startOfDay(span.checkOut).getTime() === day.getTime()

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index)

    const night =
      confirmed.find((span) => holdsNight(span, date)) ??
      live.find((span) => holdsNight(span, date)) ??
      null
    const leaving = night
      ? null
      : (live.find((span) => leaves(span, date)) ?? null)

    const inBuffer = confirmed.some(
      (span) =>
        !holdsNight(span, date) &&
        overlapsDay(span.checkOut, span.blockedUntil, date) &&
        span.blockedUntil > atTime(date, earliestArrival)
    )

    return {
      key: date.toISOString().slice(0, 10),
      date,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      isToday: todayTime !== null && date.getTime() === todayTime,
      isPast: todayTime !== null && date.getTime() < todayTime,
      occupied: night !== null && holdsDates(night),
      pending: night !== null && night.status === "PENDING",
      inBuffer,
      isLeavingDay: leaving !== null,
      span: night ?? leaving,
    }
  })
}
