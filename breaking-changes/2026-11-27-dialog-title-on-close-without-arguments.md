# DialogTitle calls onClose without arguments

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog` (`DialogTitle`)

## What changed

A click on DialogTitle's close (X) button calls `onClose` without arguments. It passed
the click event, although `onClose` is typed `() => void`.

## Why

An `onClose` with an optional parameter got the event as that parameter:
`onClose={(confirmed?: boolean) => resolve(confirmed ?? false)}` resolved with the event
object, and `onClose={reject}` rejected with it.

## Migration

- Required for any app whose DialogTitle `onClose` uses its argument (a function with an
  optional parameter, or a promise's `resolve` or `reject` passed directly): the argument
  is `undefined` now, no longer the click event. Check that the function handles
  `undefined`; `onClose={reject}` rejects with `undefined`.
- An `onClose` that ignores its arguments has nothing to do.
