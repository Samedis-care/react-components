# Notifications: refreshInterval 0 switches polling off

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Notifications`

## What changed

`refreshInterval` now accepts a positive number of ms up to 2^31 - 1 (about 24.8 days,
the longest timer delay browsers support), as before, and defines every other value:

| `refreshInterval`                         | Before                                         | Now                       |
| ----------------------------------------- | ---------------------------------------------- | ------------------------- |
| `0`                                       | `loadLatest` every few ms                      | no polling                |
| above 2^31 - 1, `Infinity` included       | every few ms, or a wrapped-around delay        | no polling                |
| a negative number, `NaN`                  | `loadLatest` every few ms                      | the default, 60000        |
| unset, or 1 to 2^31 - 1                   | unchanged                                      | unchanged                 |

Without polling, `loadLatest` is still called on mount and on every window focus event.

## Why

The value went to `setInterval` unchecked. Browsers convert the delay to a 32-bit
integer and run the invalid ones at their minimum delay, so `loadLatest` (a backend
request in a typical app) ran about 250 times a second, and there was no value that
switched polling off, e.g. for an app that gets push updates.

## Migration

Nothing to do for apps that leave `refreshInterval` unset or pass a positive interval.
To switch polling off, pass `refreshInterval={0}` instead of a very long interval.
