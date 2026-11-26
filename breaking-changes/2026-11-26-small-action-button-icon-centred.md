# The icon of a small ActionButton is centred

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/UIKit` (`ActionButton`)

## What changed

The icon of an ActionButton with `small` now sits in the middle of the button. MUI's start
icon margins, which space an icon from its label (at the default size `-4px` on the left,
`8px` on the right), no longer apply to a small button. Its icon used to sit 6px left of
the centre; the button is now as wide as its icon plus the same padding on both sides, 4px
narrower than before at the default size. A small button that `fullWidth` stretches shows
its icon in its middle instead of at its left edge. Buttons without `small` look as before.

## Why

The rules meant to centre the icon never matched: one targeted the button instead of its
icon, the other a label element that MUI no longer renders. A small button looked as if it
had more padding on the right than on the left, which showed most in a row of them.

## Migration

Nothing to do. Small ActionButtons look different in screenshots. A theme or `sx` that
moved the icon of a small button to make up for the offset can drop that rule.
