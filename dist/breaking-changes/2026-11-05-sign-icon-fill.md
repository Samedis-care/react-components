# SignIcon passes a fill prop through and sets no fill of its own

- **Date:** 2026-11-05
- **Kind:** behavior
- **Scope:** `standalone/Icons`

## What changed

`SignIcon` no longer sets `fill="#1d1d1b"` on its `<svg>`. A `fill` passed to it now
reaches the `<svg>`, as it does on the other icons. It used to be replaced by `#1d1d1b`.

## Why

The hard-coded near-black was the only fixed color among the icons, and it overrode a
caller's `fill`.

## Migration

Nothing to do. The icon looks the same: MUI's `fill: currentColor` style wins over the
`fill` attribute, so `SignIcon` keeps following `color` and `htmlColor`, with or without
a `fill` prop.
