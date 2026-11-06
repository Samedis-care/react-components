# InfiniteScroll debounces loadMoreTop, and keeps debouncing callbacks passed after mount

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/InfiniteScroll` (and so `Notifications`' `loadUnread` and the weeks
  `ScrollableSchedule` loads above)

## What changed

`callBackDebounce` (default 100 ms) only applied to the `loadMoreBottom` passed at mount.
Everywhere else it applied the wrong way round:

- `loadMoreTop` was called synchronously on every scroll event at the top, and with
  `callBackDebounce={0}` it was deferred by a 0 ms timer.
- Once the parent passed a new `loadMoreBottom` (an inline arrow function, or a
  `useCallback` with dependencies that change), or `callBackDebounce` changed,
  `loadMoreBottom` was called synchronously on every trigger from then on, and deferred by a
  0 ms timer with `callBackDebounce={0}`.

Now both callbacks follow `callBackDebounce` for the whole life of the component: a burst of
triggers results in one call, `callBackDebounce` ms after the last trigger, and `0` calls
them synchronously. A changed `callBackDebounce` applies from the next trigger.

## Why

`callBackDebounce` is documented for both callbacks. Without it, a few scroll events at the
top called `loadMoreTop` once per event, and a list whose parent passed a new
`loadMoreBottom` lost its debounce.

## Migration

Nothing to do. `loadMoreTop` is now called once per burst of scroll events at the top,
100 ms after the last one, instead of right away on each of them. A list that needs the top
call without delay passes `callBackDebounce={0}`, which applies to both callbacks.
