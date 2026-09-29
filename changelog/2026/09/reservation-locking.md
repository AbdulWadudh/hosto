# Requests are free; approval is what locks

Anyone may ask for any dates. Overlapping requests pile up without complaint. Only an
approved reservation occupies the calendar, and approval can be taken back.

## Why

An availability calendar that refuses a request at submission has already made the owner's
decision for them. The owner wants to see the competing asks for a popular week and choose,
not be told that the first person to click won.

That inverts the usual booking model, so it has to be enforced somewhere it cannot be
forgotten. Two managers approving overlapping requests in the same second is a real race,
not a theoretical one.

## How

A PostgreSQL exclusion constraint over `(propertyId =, tstzrange(checkIn, blockedUntil) &&)`,
partial on `status = 'CONFIRMED'`. It fires on UPDATE as well as INSERT, so the second
approval fails at the database even if the application never checks.

The blocked window ends at `blockedUntil`, a stored column written as
`checkOut + turnoverBufferMinutes`. Ranges are half-open, so a stay beginning exactly when
the buffer closes is legal.

Reservations that have ended are frozen by a `BEFORE UPDATE OR DELETE` trigger. The owner
has absolute control over the present and the future and none over the past. A stay in
progress counts as present — the cut-off is the end of the blocked window, not check-in.

## What was measured

`bun run db:check` runs against a live database and asserts:

- three overlapping requests coexist as pending
- the first approval succeeds
- approving either of the overlapping two then fails
- inserting a row straight into `CONFIRMED` over a taken window fails
- rejecting an approval frees the window for a competitor
- a stay starting exactly at `blockedUntil` is approvable
- a reservation that has ended refuses both UPDATE and DELETE
- check-out before check-in fails

## What was rejected

**A serializable transaction.** Correct, but only while every write path remembers to use
it. The first Server Action written in a hurry six months from now will not.

**An advisory lock on `propertyId`.** Same objection, plus it serialises every write to a
property rather than only the conflicting ones.

**A generated column for `blockedUntil`.** Preferable — it could not drift from `checkOut`
plus the buffer. PostgreSQL rejects it: `timestamptz + interval` is `STABLE`, not
`IMMUTABLE`, because the result depends on the session time zone. Writing the column from
the application is the available option, so the arithmetic is a pure function with its own
test rather than a database guarantee.

**Reading `turnoverBufferMinutes` from the property inside the constraint.** An exclusion
constraint can only reference columns of its own row. Hence the stored `blockedUntil`, and
hence the consequence that a reservation's window freezes at request time: changing a
property's buffer affects future requests only.

**Blocking pending requests, as originally built.** Reversed before release. It made a
request a hold, which is the model this product exists to avoid.
