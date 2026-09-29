import assert from "node:assert/strict"
import {
  buildMonth,
  coversDay,
  dayLabel,
  dayRangeLabel,
  momentLabel,
  nightsBetween,
  rangeHasConflict,
  type Span,
  startOfDay,
} from "@/lib/calendar/month"
import { buildWeekRibbons } from "@/lib/calendar/ribbons"

const at = (local: string) => new Date(local)

const stay = (
  id: string,
  checkIn: string,
  checkOut: string,
  blockedUntil: string,
  status = "CONFIRMED"
): Span => ({
  id,
  label: id,
  checkIn: at(checkIn),
  checkOut: at(checkOut),
  blockedUntil: at(blockedUntil),
  status,
})

const october = (day: number) =>
  buildMonth(2026, 9, spans, null).find(
    (cell) => cell.date.getMonth() === 9 && cell.day === day
  )

const spans = [
  stay("booked", "2026-10-03T22:00", "2026-10-04T22:00", "2026-10-05T02:00"),
  stay(
    "asked",
    "2026-10-09T15:00",
    "2026-10-13T11:00",
    "2026-10-13T11:45",
    "PENDING"
  ),
  stay("visit", "2026-10-20T09:00", "2026-10-20T22:00", "2026-10-20T22:45"),
]

function nightsAreTheNightsSlept() {
  assert.equal(october(3)?.occupied, true, "the third is a night slept")
  assert.equal(october(4)?.occupied, false, "the fourth is not a night slept")
  assert.equal(october(4)?.isLeavingDay, true, "the fourth is the leaving day")
  assert.equal(
    october(4)?.span?.id,
    "booked",
    "the leaving day still belongs to the stay"
  )
}

function turnoverClosesOnlyWhatItReaches() {
  assert.equal(
    october(4)?.inBuffer,
    true,
    "a guest leaving at ten at night closes that day"
  )
  assert.equal(
    october(5)?.inBuffer,
    false,
    "a window ending at two in the morning leaves the day after open"
  )
  assert.equal(october(5)?.span, null, "the fifth belongs to nobody")
}

function aRequestHoldsNothing() {
  assert.equal(october(9)?.pending, true, "the ninth was asked for")
  assert.equal(october(9)?.occupied, false, "asking does not occupy")
  assert.equal(
    rangeHasConflict(at("2026-10-09T00:00"), at("2026-10-11T00:00"), spans),
    false,
    "nights somebody only asked for can be asked for again"
  )
  assert.equal(
    rangeHasConflict(at("2026-10-03T00:00"), at("2026-10-04T00:00"), spans),
    true,
    "nights that are booked cannot"
  )
  assert.equal(
    rangeHasConflict(at("2026-10-05T00:00"), at("2026-10-06T00:00"), spans),
    false,
    "the day after a turnover that has finished is free"
  )
}

function aDayVisitOccupiesItsDay() {
  assert.equal(october(20)?.occupied, true, "a day visit holds its own day")
  assert.equal(
    october(20)?.isLeavingDay,
    false,
    "a day visit is not a leaving day"
  )
}

function rejectedAndCancelledHoldNothing() {
  const dead = [
    stay("gone", "2026-10-25T15:00", "2026-10-27T11:00", "2026-10-27T12:00", "REJECTED"),
    stay("off", "2026-10-25T15:00", "2026-10-27T11:00", "2026-10-27T12:00", "CANCELLED"),
  ]
  const days = buildMonth(2026, 9, dead, null)
  const twentyFifth = days.find(
    (cell) => cell.date.getMonth() === 9 && cell.day === 25
  )

  assert.equal(twentyFifth?.occupied, false, "a rejected stay is not booked")
  assert.equal(twentyFifth?.pending, false, "nor is it still waiting")
  assert.equal(twentyFifth?.span, null, "and it claims no day")
  assert.equal(
    rangeHasConflict(at("2026-10-25T00:00"), at("2026-10-27T00:00"), dead),
    false,
    "its nights are free"
  )
}

function ribbonsSpanAndClip() {
  const days = buildMonth(2026, 9, spans, null)
  const weeks = Array.from({ length: 6 }, (_, index) =>
    buildWeekRibbons(days.slice(index * 7, index * 7 + 7), spans)
  )
  const all = weeks.flat()

  const booked = all.filter((ribbon) => ribbon.span.id === "booked")
  assert.equal(booked.length, 1, "a stay inside one week draws one ribbon")
  assert.equal(
    booked[0]?.endColumn - booked[0]?.startColumn,
    2,
    "the third to the fourth covers two columns"
  )
  assert.equal(booked[0]?.clippedStart, false, "it starts where it starts")
  assert.equal(booked[0]?.clippedEnd, false, "and ends where it ends")

  const asked = all.filter((ribbon) => ribbon.span.id === "asked")
  assert.equal(asked.length, 2, "a stay crossing a week draws twice")
  assert.equal(asked[0]?.clippedEnd, true, "the first piece is cut at the week")
  assert.equal(asked[1]?.clippedStart, true, "the second picks it up")
  assert.equal(asked[1]?.clippedEnd, false, "and finishes properly")
}

function overlappingRequestsStack() {
  const crowd = [
    stay("a", "2026-10-05T15:00", "2026-10-08T11:00", "2026-10-08T12:00", "PENDING"),
    stay("b", "2026-10-06T15:00", "2026-10-09T11:00", "2026-10-09T12:00", "PENDING"),
    stay("c", "2026-10-07T15:00", "2026-10-08T11:00", "2026-10-08T12:00", "PENDING"),
  ]
  const days = buildMonth(2026, 9, crowd, null)
  const week = days.slice(7, 14)
  const ribbons = buildWeekRibbons(week, crowd)

  assert.equal(ribbons.length, 3, "every request is drawn")
  assert.deepEqual(
    ribbons.map((ribbon) => ribbon.lane),
    [0, 1, 2],
    "requests that overlap take a lane each"
  )
}

function separateStaysShareALane() {
  const apart = [
    stay("early", "2026-10-05T15:00", "2026-10-06T11:00", "2026-10-06T12:00"),
    stay("late", "2026-10-08T15:00", "2026-10-09T11:00", "2026-10-09T12:00"),
  ]
  const days = buildMonth(2026, 9, apart, null)
  const ribbons = buildWeekRibbons(days.slice(7, 14), apart)

  assert.deepEqual(
    ribbons.map((ribbon) => ribbon.lane),
    [0, 0],
    "stays that do not touch sit on one line"
  )
}

function labelsSayWhatWasChosen() {
  assert.equal(dayLabel(at("2026-10-03T22:00")), "03-Oct-2026")
  assert.equal(
    dayRangeLabel(at("2026-10-03T22:00"), at("2026-10-04T22:00")),
    "03-04 Oct 2026",
    "a range inside one month says the month once"
  )
  assert.equal(
    dayRangeLabel(at("2026-10-30T15:00"), at("2026-11-02T11:00")),
    "30 Oct - 02 Nov 2026",
    "a range across months names both"
  )
  assert.equal(
    dayRangeLabel(at("2026-12-30T15:00"), at("2027-01-02T11:00")),
    "30-Dec-2026 - 02-Jan-2027",
    "a range across years says both in full"
  )
  assert.equal(momentLabel(at("2026-10-03T22:00")), "03-Oct-2026, Night")
  assert.equal(momentLabel(at("2026-10-04T11:00")), "04-Oct-2026, Morning")
  assert.equal(momentLabel(at("2026-10-04T15:00")), "04-Oct-2026, Afternoon")
  assert.equal(momentLabel(at("2026-10-04T19:00")), "04-Oct-2026, Evening")
  assert.equal(
    momentLabel(at("2026-10-05T02:00")),
    "05-Oct-2026, Night",
    "two in the morning is still night"
  )
}

function countingAndCovering() {
  assert.equal(
    nightsBetween(at("2026-10-05T00:00"), at("2026-10-08T00:00")),
    3,
    "the fifth to the eighth is three nights"
  )
  const span = { checkIn: at("2026-10-03T22:00"), checkOut: at("2026-10-05T11:00") }
  assert.equal(coversDay(span, startOfDay(at("2026-10-03T00:00"))), true)
  assert.equal(coversDay(span, startOfDay(at("2026-10-05T00:00"))), true)
  assert.equal(coversDay(span, startOfDay(at("2026-10-06T00:00"))), false)
}

const checks = [
  nightsAreTheNightsSlept,
  turnoverClosesOnlyWhatItReaches,
  aRequestHoldsNothing,
  aDayVisitOccupiesItsDay,
  rejectedAndCancelledHoldNothing,
  ribbonsSpanAndClip,
  overlappingRequestsStack,
  separateStaysShareALane,
  labelsSayWhatWasChosen,
  countingAndCovering,
]

for (const check of checks) {
  check()
}

console.log(`calendar: ${checks.length} checks passed`)
