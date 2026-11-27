# SignalPortlet calls onRefresh without arguments

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/SignalPortlet`

## What changed

A click on SignalPortlet's Refresh button (or Enter or Space on it) calls `onRefresh`
without arguments. It passed the click event, although `onRefresh` is typed `() => void`.

## Why

An `onRefresh` with an optional parameter got the event as that parameter, and TypeScript
does not flag it: react-query's `refetch`, passed as it is, read the click event as its
refetch options.

## Migration

- Required for any app whose `onRefresh` reads the click event from its argument: the
  argument is `undefined` now. Take what the handler needs from elsewhere, e.g. a ref.
- Nothing to do for an `onRefresh` that ignores its arguments, or whose parameters are
  optional, such as react-query's `refetch` passed as it is: it now runs with its
  defaults instead of reading the event as its options.
