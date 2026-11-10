# InfiniteScroll loads nothing while it is hidden, and fills once it is shown

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `standalone/InfiniteScroll` (and so `Notifications` and `ScrollableSchedule`)

## What changed

A scroll container that stays mounted inside a `display: none` ancestor (an inactive tab or
panel kept mounted) has no layout box: its `scrollHeight` and `clientHeight` are both 0, so the
fill check never found it filled. `InfiniteScroll` called `loadMoreBottom` again after every
page, about ten times a second, until the consumer ran out of data.

Now `loadMoreBottom` is not called while the container has no layout box (it or an ancestor
is `display: none`). The component observes the container's size with a `ResizeObserver`
until it gets a box, and then fills it as usual. This does not need `dynamicallySized`. A
container that is displayed but 0px high, such as an empty list bounded by `max-height`, is
filled as before.

## Why

A list in a hidden panel fetched its whole dataset in the background.

## Migration

Nothing to do. A list mounted in a hidden panel no longer requests its first page until the
panel is shown. If you read anything from the loaded rows while the panel is hidden (a count
in a tab label, say), fetch it separately.
