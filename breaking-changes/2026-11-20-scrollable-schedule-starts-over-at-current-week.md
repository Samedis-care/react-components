# ScrollableSchedule starts over at the current week after a filter or language change

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Schedule` (`ScrollableSchedule`)

## What changed

A filter change and a components-care language change start the list over as on mount:
it is filled again from the current week on, and the current week is the first one in view.
To do so, ScrollableSchedule replaces its scroll container with a new one instead of
emptying the old one. When focus was inside the list (on the list itself or on an entry),
it moves to the new list.

Until now the list was emptied in place. In a browser, emptying a container that was
scrolled down clamps its scroll position to 0 and fires a scroll event, which counted as
reaching the top: last week was requested and shown first, so the list started at last
week. Focus on an entry fell to the page.

## Why

After changing a filter, the user saw last week's entries instead of the current week's,
and the list did not look like it did when the page opened.

## Migration

Nothing to do. Code that keeps a reference to the scroll container element (found through
`wrapperClass` or `classes.scroller`) must look it up again after a filter or language
change; the classes apply to the new element as before.
