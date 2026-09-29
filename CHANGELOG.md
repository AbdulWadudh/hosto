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
- A dashboard. Signing in takes you there, and it lists the places you look after with
  the turnover window and privacy setting on each.
- Adding a property: name, address, how many it sleeps, the turnover window, whether
  names are shown, and whether you charge at all.
- Photographs: drop them in or choose them, watch each one upload, drag to reorder,
  and the first is the cover.
- Address search on the map, so guests can get directions to the door.
- A page for every property that anyone can open, with a month calendar showing which
  nights are taken, which are turnover, and which have been asked for.
- Day visits: arrive in the morning and leave the same night, with no overnight at all.
- Choose when you arrive and leave — morning, afternoon, evening or night.
- Asking for dates on the calendar itself: click or drag across the nights you want.
  Click inside a chosen range to shorten it, and a floating chip shows the range with
  a way to clear it.
- Owners edit the name, address, description and how many the place sleeps, and can
  type a capacity rather than only stepping to it.
- A settings screen per property, including whether it is taking requests at all.
- Approve or reject a request from the request itself, and revoke a booking you already
  approved. Only for dates that have not yet passed.
- A request you turned down stays on the list, greyed, with an Approve after all on it.
  Changing your mind was always meant to be possible; deleting the evidence was not.
  The person who asked keeps seeing it too, marked Turned down, rather than watching
  their request disappear without a word.
- Picking a stay from the list marks it on the calendar and turns to the month it falls
  in, so you can see a stay rather than read its dates.
- Every day of a stay carries the name of whoever has it, and clicking a taken day opens
  that reservation. Names appear only where they would appear anywhere else; a property
  that keeps them private stays private on the grid too.
- A landing page, plus the Terms and Privacy pages Google asks for before it will verify sign-in.
- Postgres and S3-compatible storage that come up with the dev server rather than after it.
- Database migrations, applied automatically before the server starts.
- One build now serves localhost and production; the site address is no longer baked in.

### Changed

- Prettier and ESLint are gone. Biome does both jobs.
- All source lives under `src/`; `@/*` points there.

### Fixed

- Property photographs show up instead of a broken image.
- Dates already past are visibly struck out on the calendar. They looked exactly like
  free ones, so there was no way to tell what you could actually ask for.
- The night you arrive and the night you leave are drawn as half days, so a stay from
  the third to the fourth reads as the one night it is rather than two whole days.
- A range can no longer be drawn straight through nights that are already taken.
- A stay says how long it really is: "1 night, 13 hours" rather than a night count that
  ignored the times you picked. Arriving at night and leaving next morning no longer
  reads the same as arriving in the morning and leaving the night after.
- Leaving before you arrive is caught while you pick, not after you send it.
- Picking a single day shows as selected instead of leaving the calendar blank.
- Your own request is visible to you the moment you send it, so you can see what dates
  you asked for. Everyone else still sees nothing until the owner approves it.
- Dates read as 03-Oct-2026 everywhere, and a time says which part of the day it is —
  "03-Oct-2026, night" — since nobody picks a clock time, only a part of the day.
- A stay no longer claims to be held until a date nobody chose. The turnover window is
  stated as what it is: four hours after they leave.
- The day someone leaves is drawn as part of their stay rather than as anonymous
  turnover, so a stay from the third to the fourth marks both days.
- On a phone, a dialog sits flush against the bottom of the screen with its close at the
  bottom right, within reach of a thumb, instead of floating in the middle with its
  close in the far corner.

- Deployments no longer start against a database that was never migrated. On hosts that
  build and serve separately, the migration step was being skipped entirely.
- A missing setting now stops the deployment and names itself, instead of turning every
  sign-in into an unexplained server error.

- Buttons that are really links now announce themselves properly to a screen reader.
- Signing in no longer leaves the header offering to sign you in.
- A page no longer crashes when the browser autofills a form. The dark-mode shortcut
  assumed every key press carries a key; autofill does not.
- The Prisma CLI no longer installs a release candidate a whole major version ahead of the client.
- Starting the services no longer reports failure when the one-shot bucket job finishes successfully.
