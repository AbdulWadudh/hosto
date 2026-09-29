# Changelog

Short, user-facing summary. The long form — why, what was measured, what was rejected — lives in
`changelog/<year>/<month>/`.

## Unreleased

### Added

- Properties with a turnover window set in minutes: forty-five between short stays, two days between seasons.
- Booking requests anyone can make for any dates. Overlapping requests sit side by side until somebody decides.
- Approval, which is the only thing that actually holds nights. Rejecting or sitting on a request holds nothing.
- Approval you can take back, freeing the dates for whoever you would rather give them to.
- A refusal, from the database itself, when two people try to approve the same nights at once.
- Reservations that have ended are read-only. Everything from today forward stays yours to change.
- Per-property switches for showing who reserved and for charging at all. Amounts are in rupees.
- Sign-in and sign-up, with an email and password or with Google, and an admin role.
- A password field you can reveal, so you can check what you typed before submitting.
- A landing page, plus the Terms and Privacy pages Google asks for before it will verify sign-in.
- Postgres and S3-compatible storage that come up with the dev server rather than after it.
- Database migrations, applied automatically before the server starts.
- One build now serves localhost and production; the site address is no longer baked in.

### Changed

- Prettier and ESLint are gone. Biome does both jobs.
- All source lives under `src/`; `@/*` points there.

### Fixed

- Deployments no longer start against a database that was never migrated. On hosts that
  build and serve separately, the migration step was being skipped entirely.
- A missing setting now stops the deployment and names itself, instead of turning every
  sign-in into an unexplained server error.

- Buttons that are really links now announce themselves properly to a screen reader.
- A page no longer crashes when the browser autofills a form. The dark-mode shortcut
  assumed every key press carries a key; autofill does not.
- The Prisma CLI no longer installs a release candidate a whole major version ahead of the client.
- Starting the services no longer reports failure when the one-shot bucket job finishes successfully.
