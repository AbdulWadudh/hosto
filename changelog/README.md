# Changelog

`CHANGELOG.md` at the repository root is the short, user-facing summary. Keep it in plain
language a property owner would understand: what they can now do, what changed under them,
what stopped being broken.

This folder holds the long form, one file per substantive decision, filed under
`<year>/<month>/`. A long-form entry answers three questions:

- **Why** the change was made.
- **What was measured** — the check that proves it works, or the observation that prompted it.
- **What was rejected** — the alternatives considered, and why they lost.

Not every root entry needs a long-form file. A decision that would be expensive to reverse
does. A copy change does not.

Decisions that never shipped do not belong in `CHANGELOG.md`. If the design changed while a
feature was still unreleased, that is a decision record — it goes in `LLM_STATE.md` and, if it
is worth the detail, here. The root changelog only ever describes what a user can observe.
