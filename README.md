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
bun run db:deploy        # applies migrations, constraints and triggers
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

Its CORS allows any origin, which is fine for a service bound to this machine. A bucket
reachable from anywhere else must allow only the hosts that serve the app — browsers
`PUT` straight to storage from a presigned URL, so the bucket, not the app, is what
decides who may upload.

## Scripts

| | |
|---|---|
| `bun run dev` | Docker up, then Next dev |
| `bun run build` | Apply migrations, then build |
| `bun run start` | Apply migrations, then serve |
| `bun run lint` / `format` | Biome |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run services:up` / `services:down` | Docker stack only |
| `bun run db:migrate` | Create and apply a migration after a schema change |
| `bun run db:deploy` | Apply pending migrations (what `start` runs) |
| `bun run db:status` | Show which migrations are applied |
| `bun run db:check` | Prove the reservation constraints against the live database |
| `bun run calendar:check` | Prove the night, turnover and ribbon rules, no database needed |
| `bun run db:studio` | Prisma Studio |

### Migrations run before the server does

`bun run start` is `prisma migrate deploy && next start`. Production cannot come up
against a schema that has not caught up.

`migrate deploy` runs **only** files under `prisma/migrations/`. The exclusion constraint,
the CHECKs and the freeze-past trigger are therefore written into the migration itself,
not kept in a side-car SQL file that deployment would ignore.

That has a consequence worth remembering: `prisma migrate dev` writes the table diff and
nothing more. **If you change a constraint or a trigger, append the SQL to the generated
migration by hand.**

`prisma` and `dotenv` are runtime dependencies rather than devDependencies, because
`start` shells out to the Prisma CLI and `prisma.config.ts` imports `dotenv`.

**Never rename a migration directory that has already been deployed.** Prisma tracks
applied migrations by folder name, so a rename reads as a new migration, and the second
run of the same `CREATE TABLE` fails and blocks every deployment after it with P3009.
Recovering means renaming the row in `_prisma_migrations` to match, and deleting the
failed one — the checksums will already agree, because the file never changed.

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

## Deploying

Migrations run in **both** `build` and `start`, deliberately. Platforms differ in which
one they give you:

- **Vercel and similar** run `next build` and serve through their own runtime. Your
  `start` script is never executed, so a migration gate that only lives there silently
  never runs and production comes up against an empty database.
- **A container or a plain Node host** runs `start`, and may build elsewhere.

`migrate deploy` is idempotent, so running it twice costs nothing.

Required environment variables in the deployment, not just in local `.env`:

| | |
|---|---|
| `DATABASE_URL` | must be reachable **from the deployment**. A `localhost` URL works on your machine and never in a serverless function. |
| `BETTER_AUTH_SECRET` | any 32+ byte random string |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | both or neither |

They are validated at import, so a missing one fails the build with the variable's name
rather than turning into a 500 at runtime.

## Google sign-in

Register these as **Authorized redirect URIs** on the OAuth client:

```
http://localhost:3000/api/v1/auth/callback/google
https://hosto.k79.quest/api/v1/auth/callback/google
https://hosto-k79.vercel.app/api/v1/auth/callback/google
```

The `/v1/` is not a typo. Better Auth defaults to `/api/auth`; this app mounts it under
the versioned prefix, so the value every online guide gives you will fail with
`redirect_uri_mismatch`.

There is no `BETTER_AUTH_URL`. The origin is derived from the request and checked against
`config.auth.allowedHosts`, so one build serves `localhost`, `hosto.k79.quest`,
`hosto-k79.vercel.app` and `hosto-k79-*.vercel.app` previews. **Add a host there before
deploying to it**, or that deployment will refuse to build its own callback URLs.

Preview deployments get email and password sign-in but not Google: their hostnames change
per deployment, so they cannot be registered as redirect URIs.

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
