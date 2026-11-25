# InfiniteScroll opens at its first row and loads on top without hiding any of it

- **Date:** 2026-11-20
- **Kind:** behavior, type
- **Scope:** `standalone/InfiniteScroll` (and so `Notifications` and `ScrollableSchedule`)

## What changed

With `loadMoreTop` set:

- The list is no longer scrolled 24px down once its content fills it, and no longer set to
  `scrollTop` 1 when it reaches its top. It opens at its first row, fully visible, and its
  first pixel can be scrolled to.
- `loadMoreTop` is called once the content fills the container while it is at its top: after
  mount, after the list became short again (e.g. it was emptied and filled again), after a
  hidden container (`display: none`) is shown again, and when `loadMoreTop` is passed after
  mount. So the list opens with a page already loaded above its first row. As before, it is
  also called when a scroll reaches the top.
- While the container is at its top, rows added above the rows in view no longer push them
  down: the component keeps the first visible row where it is, also while the rows added
  above grow afterwards (a placeholder replaced by its data), until the list is scrolled.
  Browsers' own scroll anchoring does not apply to a container at its top.
- `Notifications` calls `loadUnread` as the popover opens, when the notifications fill the
  list. `ScrollableSchedule` loads the previous week as it opens (`loadWeekCallback` with
  week offset `-1`), above the current week, which stays at the top of the list.

`loadMoreBottom` is optional. A list without it, e.g. a chat history that only grows upwards,
is filled through `loadMoreTop` while its content does not fill the container.

## Why

A container at its top fires no scroll event when the user scrolls up, so the list hid its
first 24px to make that scroll possible, and moved itself 1px down whenever it reached the
top. The Notifications popover opened with the top of the first notification cut off, a
keyboard user's focused first row ended 1px above the list's edge once rows were added above
it, and a list that was at its top when `loadMoreTop` was passed, or after it was emptied,
loaded nothing on top until it had been scrolled down first.

## Migration

Nothing required. Expect one more `loadMoreTop` call, and one more page of data, when a list
opens: `Notifications`' `loadUnread` when the popover opens, `ScrollableSchedule`'s
`loadWeekCallback` for week `-1`. Tests that count those calls, or that check the scroll
position a list opens at, need updating.
