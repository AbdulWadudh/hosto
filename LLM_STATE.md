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

### D2 - Migrations, applied before the server starts

Migrations are tracked in `prisma/migrations/`. `bun run start` is
`prisma migrate deploy && next start`, so production can never serve against a schema
that has not caught up.

`20260930000000_init` is the baseline, generated with `migrate diff --from-empty` and
then **hand-extended with the constraints Prisma cannot express**: `btree_gist`, the
exclusion constraint, both CHECKs, and the freeze-past trigger. This matters more than it
looks: `migrate deploy` runs only files under `prisma/migrations/`, so anything left in a
side-car SQL file would simply never reach production. `prisma/sql/constraints.sql` has
been deleted for that reason — a second copy is a copy that goes stale.

**Every future migration that touches a constraint or trigger must carry the SQL itself.**
`prisma migrate dev` writes the table diff and nothing else; append the rest by hand.

`prisma` and `dotenv` are runtime **dependencies**, not devDependencies. `start` shells out
to the Prisma CLI and `prisma.config.ts` imports `dotenv`, so a production install that
skips devDependencies would fail at boot.

Bun auto-loading `.env` does **not** make `dotenv` redundant here, which is worth knowing
before someone deletes it again. Bun loads `.env` into its own `process.env`, but the
Prisma CLI runs as a separate Node process and does not inherit it. Removing
`import "dotenv/config"` from `prisma.config.ts` fails with
`PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL`, under
`bun run` as well as `npx`. Tested, not assumed.

`@types/node` is deliberately *not* an explicit dependency: `@types/bun` requires
`bun-types`, which requires `@types/node`. Bun implements Node's APIs, so its types build
on them. The transitive copy is what makes better-auth's `node:sqlite` import resolve.

Resetting to a clean history later is still fine: drop `prisma/migrations/`, drop the dev
volume, and regenerate a single baseline the same way.

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

### D8 - The auth base URL is derived from the request, not an env var

`BETTER_AUTH_URL` is gone. `baseURL` is a dynamic config with
`config.auth.allowedHosts`, so localhost, production and any future preview host all work
from one build.

`allowedHosts` is what makes this safe. Deriving an origin from a bare `Host` header lets
an attacker point password-reset and OAuth callback links at their own domain. An
unlisted host is refused outright.

`protocol` is pinned per environment — `https` in production, `http` otherwise — rather
than `"auto"`. `"auto"` trusts `x-forwarded-proto` only when `trustedProxyHeaders` is on,
so behind a TLS-terminating proxy it would otherwise build `http://hosto.k79.quest/...`,
which does not match the `https` redirect URI registered with Google.

Google OAuth redirect URI, which follows `config.auth.basePath`:

```
http://localhost:3000/api/v1/auth/callback/google
https://hosto.k79.quest/api/v1/auth/callback/google
```

Note the `/v1/`. Every guide online shows `/api/auth/callback/google`, the Better Auth
default. Bumping the API version means updating the Google console in the same breath.

## Changelog

`CHANGELOG.md` holds the short, user-facing summary in plain language. Long form — why, what
was measured, what was rejected — goes in `changelog/<year>/<month>/`, one file per decision
that would be expensive to reverse. See `changelog/README.md`.

A design that changed before release is a decision record, not a changelog entry. It belongs
on this page. `CHANGELOG.md` only describes what a user can observe.

## Deferred

Everything in `.spec/backlog/`. No application code for those until cued.
