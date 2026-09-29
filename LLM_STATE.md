# LLM_STATE

Running record of decisions an agent cannot recover from the code alone.
Append; do not rewrite history.

## Stack

Bun 1.4 · Next 16 (App Router, Turbopack) · TypeScript strict · Biome (format + lint)
· Prisma 7 · PostgreSQL 18 · Better Auth 1.7 · RustFS (S3) · Docker Compose.

All application source lives under `src/`. `@/*` resolves to `src/*`.

## Decisions

### D1 — IDs are `cuid()`

Domain models (`Property`, `Reservation`) use `@default(cuid())`. Better Auth issues its
own IDs for `User`/`Session`/`Account`/`Verification`; those are left alone.

### D2 — `db push` now, migrations later

Development uses `prisma db push`. No migration history is tracked yet.

**When the schema stabilises**, switch over: delete the dev volume, run
`prisma migrate dev --name init` to capture the whole schema as migration one, then fold
`prisma/sql/constraints.sql` into that migration and drop it from the `db:push` script.
Until then `bun run db:push` re-applies the raw SQL after every push, because `db push`
cannot express an exclusion constraint and will not preserve one.

### D3 - Requests are free; approval is what locks

Anyone may submit a reservation request for any dates. Overlapping requests are allowed
to pile up: five people may all ask for the same week. Nothing is checked at submission.

The owner or manager then approves, rejects, or leaves a request sitting. Only
`CONFIRMED` occupies the calendar. `PENDING`, `REJECTED` and `CANCELLED` all leave the
dates open.

`reservation_no_overlap` is an `EXCLUDE USING gist` constraint over
`(propertyId =, tstzrange(checkIn, blockedUntil, '[)') &&)`, partial on
`status = 'CONFIRMED'`. Requires the `btree_gist` extension. It fires on UPDATE as well
as INSERT, so the second approval of two overlapping requests fails at the database even
if two managers click at the same instant.

**Approval is reversible.** A manager may take a confirmed reservation back to
`REJECTED` or `CANCELLED`, which frees the window immediately and lets a competing request
be approved in its place. The partial constraint makes this work with no extra code.

**The approval action must expect to fail.** Catch the constraint violation and tell the
manager the dates were taken while they were deciding. It is a normal outcome, not a bug.

Consequences:

- `blockedUntil` is a **stored column**, written by the application as
  `checkOut + turnoverBufferMinutes`. It is not generated, because
  `timestamptz + interval` is `STABLE` rather than `IMMUTABLE` and PostgreSQL rejects it
  in a generated column.
- A reservation's blocked window is therefore **frozen at request time**. Editing a
  property's `turnoverBufferMinutes` changes the footprint of *future* requests only.
- The calendar must distinguish confirmed occupancy from pending interest. A day with
  three pending requests and no approval is still bookable.

`bun run db:check` proves all of the above against a live database.

### D4 — Timestamps are `TIMESTAMPTZ` everywhere

Including the Better Auth tables, which the CLI emits as bare `DateTime`. Re-running
`bunx @better-auth/cli generate` will strip the `@db.Timestamptz(3)` annotations —
re-apply them if that ever happens.

### D5 — Assets live in RustFS, an S3-compatible service in Compose

Host ports **9010** (S3 API) and **9011** (console); 9000/9001 were already taken on the
dev machine. The `hosto-assets` bucket is created by a one-shot `rustfs-bucket` service
by the one-shot `rustfs-bucket` service, which sits behind the `bootstrap` Compose
profile and is invoked with `docker compose run --rm`. It is idempotent.

The profile matters: `docker compose up --wait` exits non-zero when any service it
started has exited, even successfully, so a one-shot job cannot live in the default
profile alongside `--wait`.

`bun run dev` runs `docker compose up -d --wait` first, so the dev server never starts
against a database or object store that is not accepting connections.

## Changelog

`CHANGELOG.md` holds the short, user-facing summary in plain language. Long form — why, what
was measured, what was rejected — goes in `changelog/<year>/<month>/`, one file per decision
that would be expensive to reverse. See `changelog/README.md`.

A design that changed before release is a decision record, not a changelog entry. It belongs
on this page. `CHANGELOG.md` only describes what a user can observe.

## Deferred

Everything in `.spec/backlog/`. No application code for those until cued.
