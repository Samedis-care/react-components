# LocalizedDateTimePicker opens the mobile dialog below 600px

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/LocalizedDateTimePickers`

## What changed

`LocalizedDateTimePicker` defaults `desktopModeMediaQuery` to
`"@media (pointer: fine) and (min-width: 600px)"` instead of MUI's
`"@media (pointer: fine)"`. With a mouse or trackpad on a viewport narrower than 600px
(a narrow window, or a page zoomed in far), the picker now opens MUI's mobile dialog
instead of the desktop popup. From 600px up, and on touch devices, nothing changes. A
`desktopModeMediaQuery` passed by the caller replaces the default.

This also applies where the library renders the picker itself: `DateTimeInput`, the
date-time renderers of the model types, and the DataGrid's date-time filters.

When the viewport crosses 600px (the window is resized or the zoom changes), the picker
switches between the two, as MUI's pickers do whenever their media query changes: the
field is re-created and an open popup or dialog closes.

## Why

The desktop popup puts the 320px calendar next to the time columns: 489px wide with
hours, minutes and AM/PM, 545px with seconds. In a viewport narrower than that it
scrolled the page sideways, and part of the time columns and the OK button were only
reachable by scrolling (WCAG 1.4.10 Reflow). The mobile dialog fits a 320px viewport.

## Migration

Nothing to do. Expect the mobile dialog (date and time as two steps, Cancel, Next and
OK) instead of the popup in screenshots and tests that open a `LocalizedDateTimePicker`
in a viewport narrower than 600px with a fine pointer. To keep the desktop popup there,
pass `desktopModeMediaQuery="@media (pointer: fine)"`.
