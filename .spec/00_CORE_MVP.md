# Hosto — Core MVP

The only specification an agent may write application code against. Anything not on this
page belongs in `.spec/backlog/` and stays unbuilt until cued.

## Scope

1. **Auth** — email/password and Google OAuth via Better Auth, with an `admin` role.
2. **Properties** — an owner lists an estate: slug, title, address, description, images,
   nightly price, max guests. Pricing is optional per property.
3. **Calendar** — a month grid showing occupancy as continuous ribbons, with diagonally
   split cells on turnaround days.
4. **Turnover buffer** — per-property, stored as minutes, enforced on every booking.
5. **Privacy toggle** — per-property `showReserverIdentity`, enforced server-side.

## Domain rules

**Blocked window.** A reservation occupies `[checkIn, checkOut + turnoverBufferMinutes)`.
The upper bound is persisted as `blockedUntil`.

**Requesting.** Any signed-in user may request any dates on any property. Requests never
conflict with each other and are never refused at submission. A property may hold many
overlapping requests at once.

**Approval.** The owner or a manager approves, rejects, or leaves a request pending. Only
an approved (`CONFIRMED`) reservation occupies the calendar. `PENDING`, `REJECTED` and
`CANCELLED` leave the dates available.

**Revocation.** An approval can be taken back. Returning a confirmed reservation to
`REJECTED` or `CANCELLED` frees the window at once, so the manager can hand the dates to
somebody else.

**The past is read-only.** A reservation whose blocked window has ended cannot be changed
or deleted. Everything from now forward is fully under the owner's control.

**Collision.** Two confirmed reservations on one property may never have intersecting
blocked windows. Half-open ranges mean a stay starting exactly at `blockedUntil` is legal.
Approving a request whose window collides with an existing confirmed stay must fail, and
the manager must be told why.

**Enforcement.** A PostgreSQL exclusion constraint is the authority. Application checks
exist only to produce a readable error before the database produces an opaque one.

## Privacy projection

The client never receives a database row. A reservation is projected to one of two DTOs:

- **Authorized** — viewer is an admin, owns the property, or is the reserver; or
  `showReserverIdentity` is true. Carries `reserver { name, avatar, email }` and `notes`.
- **Sanitized** — everyone else. `status` collapses to `RESERVED`, `reserver` is `null`,
  `notes` is `null`.

The projection happens on the server. PII must never cross the wire to a viewer who has
not earned it — verifiable by inspecting the network payload, not by reading the code.

## Acceptance

- Two managers approving overlapping requests at once: the second fails deterministically.
- Five overlapping requests can coexist as pending without error.
- An anonymous visitor's payload for a private property contains no reserver name,
  avatar, email or notes.
- Changing `turnoverBufferMinutes` changes availability for new bookings on the next
  calendar fetch.
- The calendar renders multi-day spans correctly on mobile and desktop.
