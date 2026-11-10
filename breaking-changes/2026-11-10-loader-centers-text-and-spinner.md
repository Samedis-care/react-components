# The Loader centers its text and spinner as one block

- **Date:** 2026-11-10
- **Kind:** type, behavior
- **Scope:** `standalone/Loader`

## What changed

- In a parent with a definite height, the text and the spinner are centered as one block:
  the middle between the top of the text and the bottom of the spinner is the parent's
  center. Without `text`, the spinner itself is centered. Before, the group sat about 9px
  above the center with text, and the spinner alone 3.5px above it.
- Between the text and the spinner there is `theme.spacing(1)` (8px by default); it was
  11px.
- In a parent of automatic height, a Loader without `text` is 72px tall (the 40px spinner
  and `theme.spacing(2)` above and below it); it was 70px. With `text` it is 72px plus the
  text's height plus 8px; it was 70px plus the text's height, with the text at its top
  edge. The text now has the same 16px above it as the spinner has below it.
- The theme slots `outerProgressWrapper` and `innerProgressWrapper` are gone, and with them
  the 70px box around the spinner. `innerWrapper` is a flex column that holds the text and
  the spinner directly, with the gap between them and the padding above and below.
  `LoaderClassKey` is `"root" | "innerWrapper" | "progress"`, so
  `components.CcLoader.styleOverrides.outerProgressWrapper` and `.innerProgressWrapper`
  are type errors.

## Why

The spinner sat in a 70px box below the text, with 15px of empty space under it, and as an
inline element it sat above the middle of its own line box. So the visible group was never
centered, and in the 40px SignalPortlet avatar the ring sat high enough for the round clip
to cut it.

## Migration

Nothing required for the layout. Expect the Loader lower in screenshots: in a sized parent
by about 9px with text and 3.5px without.

A theme that overrides `outerProgressWrapper` or `innerProgressWrapper`: move what it sets
for the spinner to `progress`, and spacing around it to `innerWrapper` (for example its
`gap` or `padding`).
