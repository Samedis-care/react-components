# InfiniteScroll: a negative or NaN `callBackDebounce` calls at once, as `0` does

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/InfiniteScroll`

## What changed

A negative `callBackDebounce` or `NaN` now counts as `0`: `loadMoreTop` and `loadMoreBottom`
are called synchronously, and a call that still waits from an earlier value is dropped at the
next trigger instead of being joined. Before, such a value went to `setTimeout`, which waited
0 ms: the call came a task later, and triggers in the meantime joined it.

`threshold` already treated a negative number and `NaN` as `0`.

## Why

Only `0` itself called synchronously, so a value that came out of a calculation or a parsed
setting as negative or `NaN` behaved differently from `0` without the documentation saying so.

## Migration

Nothing required. An app that passes a negative `callBackDebounce` or `NaN` gets the
callbacks synchronously now, as with `0`.
