import "dotenv/config"
import assert from "node:assert/strict"
import { prisma } from "../src/lib/prisma"
import { projectReservation } from "../src/lib/properties/reservationView"

const OWNER = "chk-owner"
const PROPERTY = "chk-property"
const at = (iso: string) => new Date(iso)

const request = (id: string, checkIn: string, blockedUntil: string) =>
  prisma.reservation.create({
    data: {
      id,
      propertyId: PROPERTY,
      guestId: OWNER,
      checkIn: at(checkIn),
      checkOut: at(blockedUntil),
      blockedUntil: at(blockedUntil),
      totalPrice: "100.00",
    },
  })

const approve = (id: string) =>
  prisma.reservation.update({ where: { id }, data: { status: "CONFIRMED" } })

const rejects = (label: string, run: () => Promise<unknown>) =>
  assert.rejects(run, `${label} should have been rejected by the database`)

function checkPrivacyProjection() {
  const row = {
    id: "r1",
    checkIn: at("2026-10-10T15:00:00Z"),
    checkOut: at("2026-10-15T11:00:00Z"),
    blockedUntil: at("2026-10-15T15:00:00Z"),
    status: "CONFIRMED" as const,
    notes: "Secret note",
    endedReason: null,
    guestId: "guest-1",
    guest: { name: "Priya", email: "priya@example.com", image: null },
  }
  const privateProperty = { ownerId: "owner-1", showReserverIdentity: false }
  const openProperty = { ownerId: "owner-1", showReserverIdentity: true }

  const hidden = projectReservation(row, privateProperty, null)
  assert.equal(
    hidden.visibility,
    "anonymous",
    "a stranger must not be identified"
  )
  assert.equal(
    JSON.stringify(hidden).includes("Priya"),
    false,
    "an anonymous projection must not carry the reserver name"
  )
  assert.equal(
    JSON.stringify(hidden).includes("Secret note"),
    false,
    "an anonymous projection must not carry notes"
  )
  assert.equal(hidden.status, "RESERVED", "status must collapse to RESERVED")

  for (const [label, viewer] of [
    ["the owner", { id: "owner-1", isAdmin: false }],
    ["an admin", { id: "someone", isAdmin: true }],
    ["the reserver", { id: "guest-1", isAdmin: false }],
  ] as const) {
    assert.equal(
      projectReservation(row, privateProperty, viewer).visibility,
      "identified",
      `${label} must see the reserver`
    )
  }

  assert.equal(
    projectReservation(row, openProperty, null).visibility,
    "identified",
    "a public property identifies its reserver to anyone"
  )
}

async function main() {
  await prisma.reservation.deleteMany({ where: { propertyId: PROPERTY } })
  await prisma.property.deleteMany({ where: { id: PROPERTY } })
  await prisma.user.deleteMany({ where: { id: OWNER } })

  await prisma.user.create({
    data: { id: OWNER, name: "Check Owner", email: "check@hosto.local" },
  })
  await prisma.property.create({
    data: {
      id: PROPERTY,
      slug: "chk-property",
      title: "Check Property",
      address: "Nowhere",
      description: "Fixture for the reservation constraints.",
      imageUrls: [],
      nightlyPrice: "100.00",
      maxGuests: 2,
      turnoverBufferMinutes: 240,
      ownerId: OWNER,
    },
  })

  await request("chk-a", "2026-10-10T15:00:00Z", "2026-10-15T15:00:00Z")
  await request("chk-b", "2026-10-12T15:00:00Z", "2026-10-18T15:00:00Z")
  await request("chk-c", "2026-10-10T15:00:00Z", "2026-10-15T15:00:00Z")

  await approve("chk-a")

  await rejects("approving a request that overlaps a confirmed stay", () =>
    approve("chk-b")
  )
  await rejects("approving a second request for identical dates", () =>
    approve("chk-c")
  )
  await rejects("a new request confirmed straight into a taken window", () =>
    prisma.reservation.create({
      data: {
        id: "chk-d",
        propertyId: PROPERTY,
        guestId: OWNER,
        checkIn: at("2026-10-15T12:00:00Z"),
        checkOut: at("2026-10-20T15:00:00Z"),
        blockedUntil: at("2026-10-20T15:00:00Z"),
        status: "CONFIRMED",
      },
    })
  )
  await rejects("check-out before check-in", () =>
    request("chk-e", "2026-11-10T15:00:00Z", "2026-11-09T15:00:00Z")
  )
  await rejects("pricing enabled with no nightly price", () =>
    prisma.property.update({
      where: { id: PROPERTY },
      data: { pricingEnabled: true, nightlyPrice: null },
    })
  )

  await prisma.reservation.update({
    where: { id: "chk-b" },
    data: { status: "REJECTED" },
  })
  await request("chk-f", "2026-10-11T15:00:00Z", "2026-10-14T15:00:00Z")

  await request("chk-g", "2026-10-15T15:00:00Z", "2026-10-18T15:00:00Z")
  await approve("chk-g")

  await prisma.reservation.update({
    where: { id: "chk-a" },
    data: { status: "CANCELLED" },
  })

  await approve("chk-f")
  await prisma.reservation.update({
    where: { id: "chk-f" },
    data: { status: "REJECTED" },
  })
  await approve("chk-c")

  await prisma.reservation.create({
    data: {
      id: "chk-past",
      propertyId: PROPERTY,
      guestId: OWNER,
      checkIn: at("2020-01-10T15:00:00Z"),
      checkOut: at("2020-01-12T11:00:00Z"),
      blockedUntil: at("2020-01-12T15:00:00Z"),
      status: "CONFIRMED",
    },
  })
  await rejects("changing a reservation that has already ended", () =>
    prisma.reservation.update({
      where: { id: "chk-past" },
      data: { status: "CANCELLED" },
    })
  )
  await rejects("deleting a reservation that has already ended", () =>
    prisma.reservation.delete({ where: { id: "chk-past" } })
  )
  await prisma.$transaction([
    prisma.$executeRaw`SET LOCAL hosto.allow_past_edit = 'on'`,
    prisma.reservation.delete({ where: { id: "chk-past" } }),
  ])

  await prisma.reservation.deleteMany({ where: { propertyId: PROPERTY } })
  await prisma.property.delete({ where: { id: PROPERTY } })
  await prisma.user.delete({ where: { id: OWNER } })

  checkPrivacyProjection()

  console.log("reservation constraints: all checks passed")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
