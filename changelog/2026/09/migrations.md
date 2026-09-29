# Migrations, applied before the server starts

`bun run start` is `prisma migrate deploy && next start`.

## Why

Development had been running on `prisma db push` with no migration history, which is fine
for a schema still being argued with and useless the moment there is a server to deploy.
Production must not come up against a schema that has not caught up.

## The trap this closes

`prisma migrate deploy` runs **only** the files under `prisma/migrations/`. Every guarantee
in this product that PostgreSQL enforces — the exclusion constraint that stops two
approvals landing on the same nights, the pricing CHECK, the trigger that freezes the past
— lived in `prisma/sql/constraints.sql`, applied by a development-only script.

A deploy would have succeeded, created every table, and produced a database with no
double-booking protection whatsoever. The failure would have surfaced as a real overlapping
booking, not as an error.

The constraints now live inside `20260930000000_init` itself, and the side-car file is
deleted so there is no second copy to drift.

## What was measured

The baseline was generated with `migrate diff --from-empty`, extended by hand with the
constraint SQL, and then applied to a scratch database created from nothing. Against that
database, built purely from `prisma/migrations/`:

- `btree_gist`, `reservation_no_overlap`, `reservation_dates_ordered`,
  `property_pricing_complete` and `reservation_freeze_past` all present
- the full behavioural suite in `prisma/overlap.check.ts` passes

Presence was not treated as sufficient; the behaviour was re-proven on the migrated
database.

## What was rejected

**Keeping `db push` for development alongside migrations.** The two drift, and a migration
nobody has run is a migration nobody has tested. Development now uses `prisma migrate dev`.

**Running migrations at build time.** Builds happen in CI without database access. Boot is
the right moment.

**Leaving `prisma` and `dotenv` as devDependencies.** `start` shells out to the Prisma CLI
and `prisma.config.ts` imports `dotenv`. A production install that skips devDependencies
would fail at boot. Both are runtime dependencies now.

**Dropping `dotenv` on the grounds that Bun loads `.env` by itself.** It does, into its own
`process.env` — but the Prisma CLI is a separate Node process that does not inherit it.
Removing the import fails with `Cannot resolve environment variable: DATABASE_URL` under
`bun run` as well as `npx`.

**Declaring `@types/node` explicitly.** Removed. `@types/bun` requires `bun-types`, which
requires `@types/node`; Bun implements Node's APIs so its types build on them. The
transitive copy resolves `node:sqlite` for better-auth's types on its own.

## Note

The existing development database was baselined with `migrate resolve --applied` rather
than dropped, so no data was lost. History can still be flattened later: delete
`prisma/migrations/`, drop the volume, and regenerate one baseline the same way.
