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

The app is served from two production hosts plus Vercel previews:

| Host | Purpose |
| --- | --- |
| `localhost:3000` | development |
| `hosto.k79.quest` | canonical; what `config.site.url` points at |
| `hosto-k79.vercel.app` | Vercel production alias |
| `hosto-k79-*.vercel.app` | preview deployments |

The preview entry is deliberately scoped rather than `*.vercel.app`, which would accept a
`Host` header from anybody's Vercel app. Verified: `other-app.vercel.app` is refused.

`config.site.url` stays on the canonical host so metadata and legal pages do not advertise
the `vercel.app` alias.

Google OAuth redirect URIs, which follow `config.auth.basePath`:

```
http://localhost:3000/api/v1/auth/callback/google
https://hosto.k79.quest/api/v1/auth/callback/google
https://hosto-k79.vercel.app/api/v1/auth/callback/google
```

Preview deployments get email and password sign-in but **not** Google: their hostnames are
generated per deployment and cannot be pre-registered. The `oAuthProxy` plugin exists to
route preview OAuth through a fixed host if that is ever needed.

Note the `/v1/`. Every guide online shows `/api/auth/callback/google`, the Better Auth
default. Bumping the API version means updating the Google console in the same breath.

### D9 - Migrations run in `build` as well as `start`

Vercel never executes the `start` script. It runs `next build` and serves through its own
runtime, so a migration gate living only in `start` never fires and production comes up
against an empty database — every endpoint that touches it returns 500 while endpoints
that do not, like `/api/v1/auth/ok`, keep returning 200. That is exactly how this was
found, and it is a confusing failure to debug because it looks provider-specific.

`migrate deploy` is idempotent, so it sits in both scripts.

Consequence: `bun run build` now needs a reachable database. That is a real cost and it
was accepted, because a build that cannot reach the database would have produced a deploy
that cannot either.

### D10 - Environment is validated at import, and fails loudly

`src/config/env.ts` throws on a missing `DATABASE_URL` or `BETTER_AUTH_SECRET`, and on
`GOOGLE_CLIENT_ID` set without `GOOGLE_CLIENT_SECRET`. A deploy missing one now fails with
the variable's name instead of returning an unexplained 500.

It is **server-only**. Never import it from a client component — `src/config/index.ts` is
the one that is safe to share.

### D11 - Session reads go through a data access layer

`src/lib/session.ts` is `server-only` and exports `cache()`-memoized `getSession`, plus
`requireSession` and `redirectIfSignedIn`. Several Server Components can call it in one
render for the price of one query.

Auth checks live in **pages, not layouts**. Next's partial rendering means a layout does
not re-run on navigation, so a layout-level check does not protect the routes beneath it.
Layouts read the session only to render shell UI, and pass it to client components as
props — a client component cannot import this module.

Route groups: `(marketing)` is public with nav and footer, `(auth)` is the bare centred
column, `(app)` is signed-in.

The session read sits in `NavUser`, a nested Server Component inside `<Suspense>`, rather
than an `await` at the top of the layout. That keeps `{children}` from being held behind
the session query. It does **not** restore static generation: without PPR
(`cacheComponents`), any `headers()` read in the tree makes the whole route dynamic, and
every page is currently `ƒ`. Turning PPR on would make the landing and legal pages static
again with the user menu streaming in — a deliberate decision, not something to enable in
passing.

### D12 - Base UI Select and Switch do post in a native form

Verified rather than assumed: submitting the property form wrote
`turnoverBufferMinutes: 240` from the `Select` and `showReserverIdentity: true` from the
`Switch`, with an un-toggled switch correctly absent from the payload. No hidden inputs
needed.

They do **not** get an accessible name on their own. A `<p>` next to a control is not a
label: the accessibility tree showed `combobox` and two bare `switch` nodes. Every one now
takes `aria-labelledby` pointing at its row heading. Check the a11y tree, not the
screenshot, when adding a control to a settings row.

### D13 - Images go straight to RustFS with a presigned PUT

`POST /api/v1/uploads` requires a session, checks the content type against a small
allowlist, and returns a presigned PUT valid for five minutes. The key is always
`properties/<ownerId>/<uuid><ext>`, built on the server, so a client can never choose
where it writes. The browser then PUTs the file directly to storage; it never passes
through the application.

**The AWS SDK must have checksums disabled for S3-compatible storage.** Since v3.729 the
default `requestChecksumCalculation` injects `x-amz-checksum-crc32` into the presigned
URL as a placeholder, which RustFS validates against the real body and rejects. The PUT
fails with no console error and no object written, which is a miserable thing to debug.
`requestChecksumCalculation: "WHEN_REQUIRED"` is not optional here.

The bucket needs two pieces of configuration, both applied by the `rustfs-bucket`
bootstrap job: a policy granting anonymous `s3:GetObject` on `properties/*` so previews
load, and a CORS rule allowing `PUT` so the browser can upload at all. CORS currently
allows any origin, which is right for development and should be narrowed before this
storage is exposed publicly.

ReUI's file upload was considered and rejected: it is Radix-based, and this project runs
the Base UI `base-nova` preset. Adopting it would put two primitive libraries in the
bundle with different focus and keyboard behaviour. Reordering, the one thing it had that
was missing, was added natively instead — pointer drag plus explicit move buttons, since a
draggable element is not operable from a keyboard.

## Changelog

`CHANGELOG.md` holds the short, user-facing summary in plain language. Long form — why, what
was measured, what was rejected — goes in `changelog/<year>/<month>/`, one file per decision
that would be expensive to reverse. See `changelog/README.md`.

A design that changed before release is a decision record, not a changelog entry. It belongs
on this page. `CHANGELOG.md` only describes what a user can observe.

## Deferred

Everything in `.spec/backlog/`. No application code for those until cued.
