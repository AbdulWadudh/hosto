# Hosto

A reservation calendar for the places you look after. Built first for tracking a
property of your own, and second as something an estate owner can be sold — every
commercial feature is a switch on the property, not a plan you are locked into.

## What it does

- **Requests are free.** Anyone signed in can ask for any dates on any property.
  Overlapping requests pile up happily; nothing is held.
- **Approval is what locks.** The owner or a manager approves, rejects, or leaves a
  request sitting. Only an approved reservation occupies the calendar.
- **Turnover buffers.** Each property carries a gap, in minutes, that follows every
  confirmed stay. Forty-five minutes to change linen, two days to repaint. Nobody can be
  approved into it.
- **Never twice.** PostgreSQL itself refuses a second approval over the same nights, so
  two managers clicking at the same instant cannot both win.
- **Change your mind.** Un-approving a reservation frees the nights immediately, so a
  manager can hand them to somebody else.
- **The past is read-only.** Reservations that have ended cannot be edited or deleted;
  everything from now forward is fully under the owner's control.
- **Reserver privacy.** Switch identity off and a visitor's payload contains dates and
  nothing else — not hidden in the page, absent from the response.
- **Optional pricing.** Run a property as a private family calendar with no rates, or
  publish a nightly price. Amounts default to INR.

## Stack

| | |
|---|---|
| Runtime | Bun 1.4 |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript, strict |
| UI | shadcn preset `b6oQjRp7Ym` on Base UI, Tailwind v4 |
| Motion | `motion/react` |
| Database | PostgreSQL 18 via Prisma 7 |
| Auth | Better Auth 1.7 with the `admin` plugin |
| Assets | RustFS, S3-compatible |
| Lint + format | Biome |

## Getting started

Requires [Bun](https://bun.sh) and Docker.

```bash
bun install
cp .env.example .env     # fill in the Google OAuth pair when you need social sign-in
bun run db:push          # creates the schema and the raw SQL constraints
bun run dev              # brings Docker up, waits for health, then starts Next
```

`bun run dev` will not start the app until Postgres and RustFS are both accepting
connections, so you never debug a dev server that was pointed at nothing.

Open <http://localhost:3000>.

## Services

| Service | Host port | Notes |
|---|---|---|
| PostgreSQL | 5432 | `hosto` / `hosto` / `hosto` |
| RustFS S3 API | 9010 | bucket `hosto-assets` |
| RustFS console | 9011 | |

The bucket is created by a one-shot `rustfs-bucket` job behind the `bootstrap` Compose
profile. It is idempotent and runs on every `services:up`.

## Scripts

| | |
|---|---|
| `bun run dev` | Docker up, then Next dev |
| `bun run build` / `start` | Production build and serve |
| `bun run lint` / `format` | Biome |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run services:up` / `services:down` | Docker stack only |
| `bun run db:push` | Sync schema, then re-apply `prisma/sql/constraints.sql` |
| `bun run db:check` | Prove the reservation constraints against the live database |
| `bun run db:studio` | Prisma Studio |

### Why `db:push` has a second half

`prisma db push` cannot express an exclusion constraint and will not preserve one, so the
raw SQL in `prisma/sql/constraints.sql` is re-applied after every push. It is written to
be idempotent. Never run `prisma db push` directly — use the script.

## Domain rules worth knowing

A reservation occupies `[checkIn, checkOut + turnoverBufferMinutes)`. The upper bound is
stored on the row as `blockedUntil`, written by the application at request time.

```
[------ GUEST A ------][- BUFFER -]
checkIn            checkOut    blockedUntil
                                    |
                                    +-- guest B may start here, not before
```

Ranges are half-open, so a stay beginning exactly at `blockedUntil` is legal.

Because `blockedUntil` is frozen when the request is made, changing a property's buffer
afterwards affects **future** requests only. Existing rows keep the buffer they were
created under.

`reservation_no_overlap` is an `EXCLUDE USING gist` constraint, partial on
`status = 'CONFIRMED'`. It fires on UPDATE as well as INSERT — which means **the approve
action must expect to fail**. Catch the violation and tell the manager the dates were
taken while they were deciding. That is a normal outcome, not a bug.

Reservations that have ended are frozen by a `BEFORE UPDATE OR DELETE` trigger. To
correct a backfilled historical row, open a transaction and
`SET LOCAL hosto.allow_past_edit = 'on'` first — never from a request handler.

`bun run db:check` asserts all of it: overlapping pending requests coexist, only the first
approval wins, un-approving frees the window, and past rows refuse to change.

## Layout

```
prisma/           schema, raw SQL constraints, the constraint check
src/app/          routes; legal page copy lives beside its route
src/components/   landing/, legal/, ui/ (shadcn)
src/lib/          prisma client, auth, site constants
.spec/            00_CORE_MVP.md is in scope; backlog/ is explicitly not
LLM_STATE.md      decisions an agent cannot recover from the code
```

## Legal pages

`/terms` and `/privacy` exist because Google's OAuth consent screen demands public links
to both before it will verify an app. They are generated from `src/lib/site.ts`, so
changing the entity name, contact address or effective date in one place updates both.

**Have a lawyer read them before you submit.** They are a solid starting draft written
for this product, not legal advice.

## Not built yet

`.spec/backlog/` holds deferred RFCs — turnover task checklists, iCal sync, smart lock
code dispatch, escrow deposits, amenity add-ons. No application code for any of them
until they are cued.
