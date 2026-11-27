# An item's `className` in SignalPortlet adds to `classes.item`

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/SignalPortlet`

## What changed

A SignalPortlet row whose item has a `className` gets both class names: the portlet's
`classes.item` and the item's own `className`. Before, the item's `className` replaced
`classes.item` on that row, so the row lost the styles every other row got from
`classes.item`. Rows without a `className` render as before, and the theme slot
`CcSignalPortlet.item` styled every row before and still does.

## Why

`classes.item` is the class of every row, and an item's `className` marks one of them. A
MUI component likewise puts its `className` next to `classes.root`, never instead of it.

## Migration

Nothing to do for an app that does not pass both `classes.item` and a `className` on an
item.

Where both are set, the rows with their own `className` now get the `classes.item` styles
too: check those cards. A row that is not meant to have them needs a rule in its own class
that overrides them.
