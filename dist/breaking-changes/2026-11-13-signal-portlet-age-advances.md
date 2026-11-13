# SignalPortlet's "Last refresh" age advances while the card is mounted

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/SignalPortlet`, new hook `utils/useAgeTick`

## What changed

The age in SignalPortlet's footer ("Last refresh: 5 minutes ago") was computed only when the
card rendered, and the memoized card re-renders only when a prop or the language changes. With
no new props it kept its first value: a dashboard left open read "Last refresh: just now"
for hours.

Now the card re-renders while the age can change: on every whole second of the age while it
is less than a minute, then on every whole minute of it. The timer starts when `updatedAt`
changes to another time (a new Date of the same time doesn't restart it) and stops on unmount.
The label is not a live region, so the changing age is not announced.

The new hook `useAgeTick(timestamp)`, exported from the package root, does this for any
component that shows an age computed with `timestampToAge` during render.

## Why

The footer claimed fresh data long after the data was produced.

## Migration

Nothing to do for SignalPortlet. A test that renders it with fake timers and advances them
sees the age change. An app that shows its own `timestampToAge` age (a copy of the footer, a
notification row) can call `useAgeTick` with the same time in that component to keep the age
current.
