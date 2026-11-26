# InfiniteScroll loads before the bottom, and holds its calls while `loading` is set

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/InfiniteScroll` (and so `Notifications` and `ScrollableSchedule`)

## What changed

- New prop `threshold`, in CSS pixels, default `250`. `loadMoreBottom` is called once 250px
  or less of content are left below the visible part of the list, instead of only at the very
  bottom. The list is filled until its content overflows the container by more than 250px,
  instead of 24px; this also applies to a list filled through `loadMoreTop`. After every
  render with new `children` the list is checked for being within the threshold of the bottom,
  not only for being short, so a page that adds less than that below the view is followed by
  the next one. `loadMoreTop` is still called at the top.
- New prop `loading`, default `false`. While it is `true`, neither `loadMoreTop` nor
  `loadMoreBottom` is called, and the scroll container has `aria-busy="true"` (unless
  `aria-busy` is passed). A call that comes up meanwhile (a scroll to an end, new `children`
  that leave the list short) is made once `loading` turns `false`, if the list still needs it.
  A load that ends without new rows while no call came up is not repeated.
- `Notifications` and `ScrollableSchedule` load the next page or week before their list is
  scrolled to the bottom, and can load one more page (`loadRead`) or week
  (`loadWeekCallback`) as they open, until their content overflows the list by more than
  250px.

## Why

Loading started at the very last pixel, so users always reached a hard end before the next
rows arrived. The component did not know whether a load was running: it called the callbacks
again while one ran (on every render with new `children` while the list was short, on every
scroll at the bottom), and it never checked again after a load that ended without new
`children`. A list emptied for a new filter while a page of the old filter was loading stayed
empty when the callback's own guard dropped the call and the old page was discarded. Nothing
could tell assistive technology that the list was being updated.

## Migration

Nothing required. Expect `loadMoreBottom` calls before a list is scrolled to its bottom, and
up to one more page as a list opens: tests that count these calls, or that scroll to the very
bottom to load, may need updating. `threshold={0}` loads at the very bottom only; the list is
then filled only until its content overflows the container.

A callback that guards itself against a second call with its own loading flag can pass that
flag as `loading` instead and drop the guard: set it in the update that starts the load, and
clear it in the update that adds the rows, or when the load fails or its result is discarded.
The list is then also `aria-busy` while it loads. InfiniteScroll announces nothing: render a
loader row and the status text ("Loading…", "No more entries") in a polite live region
(`role="status"`) outside the list.
