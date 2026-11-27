# InfiniteScroll fills its container again when it grows, and `dynamicallySized` is removed

- **Date:** 2026-11-26
- **Kind:** behavior, type
- **Scope:** `standalone/InfiniteScroll` (and so `Notifications` and `ScrollableSchedule`)

## What changed

- `InfiniteScroll` observes the size of its scroll container from mount to unmount (with a
  `ResizeObserver`, or `window` resize events where there is none) and runs its fill check
  on every change. A container whose height changes without a render, such as `50vh` on a
  window resize or device rotation, a percentage or flex height, or a resizable panel, is
  filled again when it grows past its content: `loadMoreBottom` (or `loadMoreTop` for a list
  without `loadMoreBottom`) is called until the content overflows it by more than
  `threshold`, as after a render with new `children`.
- The `dynamicallySized` prop is removed. It turned this observation on; it is now always
  on.
- `Notifications` (a list of `50vh`) and `ScrollableSchedule` (whose `wrapperClass` sets the
  height) load more notifications or weeks when the window grows or the device is rotated
  while they are shown.

## Why

A list whose container grew past its content showed no scrollbar and loaded nothing more
until its `children` changed, so the user was stuck with the rows already loaded. Only lists
that passed `dynamicallySized` refilled; every list with a height that can change without a
render needed it, and the library's own lists did not pass it.

## Migration

- Required for any app that passes `dynamicallySized` to `InfiniteScroll`: remove the prop.
  TypeScript reports it as unknown, and the size is observed without it.
- Otherwise nothing to do. Tests that count `loadMoreBottom` calls may see one more after
  the list's container is resized.
