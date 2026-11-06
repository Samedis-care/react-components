# SignalPortlet shows a count above 999 as "999+"

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/SignalPortlet`

## What changed

A SignalPortlet counter whose `count` is above 999 shows "999+" in its avatar, in a smaller
font (0.7em of the avatar's font size) so that it fits the 40px circle. It used to show
"999", exactly like a count of 999.

- The visible "999+" is hidden from assistive technology. The full number follows it in
  visually hidden text, so a screen reader reads the row as "1500 Devices" (also the
  accessible name of a linked row).
- The avatar's `textContent` is "999+1500" for a count of 1500. Counts up to 999 render as
  before.
- `SignalPortletItemClassKey` has two new slots: `countCapped` (the visible "999+") and
  `countFull` (the visually hidden full number). An item's `classes` and the theme's
  `components.CcSignalPortletItem.styleOverrides` accept them.

## Why

A count above 999 read as 999, on screen and for screen readers, so a facility with 1500
devices without briefing saw and heard "999".

## Migration

Nothing to do. Expect "999+" in screenshots of dashboards with large counts. A test that
reads a capped avatar's text gets "999+" followed by the full number instead of "999".
