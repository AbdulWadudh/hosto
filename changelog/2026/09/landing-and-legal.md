# A landing page, and the pages Google requires

## Why

Google's OAuth consent screen will not verify an application without public links to a
Terms of Service and a Privacy Policy. Both are generated from `src/lib/site.ts`, so the
legal entity, contact address and effective date are set once.

The privacy policy carries the Google API Services User Data Policy paragraph, including
Limited Use, which the review specifically looks for.

## What was measured

Rendered and inspected at 390x844 before 1264 wide, in both themes. Five accessibility
errors were found and fixed: a `<Link>` rendered through Base UI's `Button` needs
`nativeButton={false}`, or it silently loses native button semantics. The browser console is
clean.

## What was rejected

**GSAP.** The house style for this kind of page calls for it, but the calendar in the owner
console needs `motion/react`'s `layoutId` for range selection, and two motion engines in one
bundle is not worth the house style. Every scroll paradigm is implemented with
`useScroll`/`useTransform` instead.

**Overriding the theme preset's typography.** The preset fixed Montserrat, Noto Sans and
Geist Mono. Changing them on the landing page would fork the theme the rest of the product
uses.

**A high-contrast inverted closing panel.** `bg-foreground text-background` reads as a
light-mode card dropped onto a dark page rather than as a deliberate inversion. It is now
the brand green, which resolves correctly in both themes and puts the accent on the section
that asks for the click.

**Stock photography in the feature grid.** A card claiming a stay reads as one continuous
ribbon should show the ribbon, not a photograph of a terrace. The accordion keeps imagery;
the grid does not. The accordion photographs are still `picsum.photos` placeholders and need
replacing.

**Owner-only calls to action.** "Start tracking" tells a guest who wants to request dates
the wrong thing. The page now offers both paths: request dates, or list a property.
