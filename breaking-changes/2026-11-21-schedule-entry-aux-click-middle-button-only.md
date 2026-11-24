# Schedule entries call onAuxClick for the middle button only

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `standalone/Schedule` (`WeeklySchedule`, `ScrollableSchedule`; `IDayData.onAuxClick`)

## What changed

An entry's `onAuxClick` (`IDayData`) is now called only when the entry is clicked with the
middle button (`event.button === 1`). Browsers fire `auxclick` for every non-primary button,
the right one (which also opens the context menu) and the back and forward buttons of some
mice included, and those used to call it as well. This holds in both schedules, which render
the same entries (`DayContents`).

## Why

`onAuxClick` is documented as the middle-click handler, and apps pass it an "open in a new
tab" handler. With such a handler, a right click on an entry opened the entry in a new tab
next to the browser's context menu.

## Migration

Nothing to do for an app that passes the link opener from `useLinkOpener` to `onClick` and
`onAuxClick`: that opener already ignores right, back and forward clicks, so a middle click
still opens the entry in a new tab.

An `onAuxClick` that relied on the right, back or forward button no longer sees them; an
entry offers no other handler for these buttons.
