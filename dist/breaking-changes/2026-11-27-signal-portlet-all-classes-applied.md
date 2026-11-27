# SignalPortlet applies `classes.lastUpdatedAt`, `refreshIconButton` and `refreshIcon`, and an item's `classes.listText`

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/SignalPortlet`

## What changed

Four class keys reach their elements:

- `classes.lastUpdatedAt` of SignalPortlet: the `span` with the "Last refresh" text
- `classes.refreshIconButton`: the Refresh IconButton
- `classes.refreshIcon`: the refresh icon in that button
- `classes.listText` of an item: the row's ListItemText

Before, these keys were accepted and typed, but their class names were dropped. The theme's
`styleOverrides` for these slots applied before and still do; a class name is added next to
them.

## Why

The four keys are part of `SignalPortletClassKey` and `SignalPortletItemClassKey`, and the
other keys of both already reached their elements. So an app could style the footer and an
item's text of one card only through the theme, for every card at once.

## Migration

Nothing required. A SignalPortlet or item that gets one of these keys, as a prop or through
the theme's `defaultProps.classes`, gets its styles now: check that the footer and the item
texts look as intended.
