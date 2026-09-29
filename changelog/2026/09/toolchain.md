# One tool for formatting and linting

Biome replaced both Prettier and ESLint.

## Why

The scaffold shipped Prettier with a Tailwind class-sorting plugin, plus ESLint with
`eslint-config-next`. Two tools, two config files, two ways to disagree about the same file.

## What was measured

ESLint could not run at all as delivered: the scaffold pinned `eslint@^10`, and
`eslint-plugin-react@7.37` — pulled in by `eslint-config-next` — crashes on it with
`contextOrFilename.getFilename is not a function`. Pinning back to `eslint@^9` fixed it,
which is the point at which keeping two tools stopped being worth defending.

After the swap: `biome lint` and `biome format` both clean across 38 files in under 15ms,
`tsc --noEmit` clean, `next build` prerenders every route. Next 16 does not invoke ESLint
during `build`, so nothing depended on it.

Biome's `next` and `react` rule domains replace `eslint-config-next/core-web-vitals`.
devDependencies went from twelve entries to seven.

## What was rejected

**Biome's Tailwind class sorter** (`nursery/useSortedClasses`), which would have replaced
`prettier-plugin-tailwindcss`. On the preset's own `button.tsx` it wanted
`"size-7 in-data-[slot=button-group]:rounded-lg rounded-[min(var(--radius-md),12px)]"` —
moving the variant ahead of the base radius, which reverses CSS source order and changes
which rule wins. Its fix is marked unsafe for exactly this reason. Class sorting is
cosmetic; silently changing which style applies is not.

**Keeping ESLint alongside Biome for the Next rules.** The domains cover them, and two
linters on one codebase is the problem this change was meant to remove.
