# InfiniteScroll calls the latest callbacks, and drops a bottom call the list no longer needs

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `standalone/InfiniteScroll` (and so `Notifications`' `loadRead` / `loadUnread` and
  `ScrollableSchedule`)

## What changed

`InfiniteScroll` kept its own debounced copy of each callback and replaced it only after a
render had finished. A call that was waiting for `callBackDebounce` when the parent passed a
new `loadMoreBottom` or `loadMoreTop` still went to the old callback, and so did the fill
check of a render that brought new `children` and a new callback together. A `loadMoreTop`
that the parent removed (set to `undefined`) while a call was waiting was still called.

Now every call reads the callback from the props when it is made, so it always reaches the
callback of the latest render. A replaced or removed callback is never called.

A `loadMoreBottom` call that waits for `callBackDebounce` is now also made only if, once the
wait is over, the content still does not fill the container (it overflows by 24px or less)
or the container is still scrolled to the bottom. A call that was requested while the list
was short is dropped when a page that arrived in the meantime has filled it.

## Why

A callback that guards with values from its render (a `loading` or "has more" flag in React
state, as in `useCallback(() => { if (loading || !hasMore) return; … }, [loading, hasMore])`)
was called through its stale copy, which still saw `loading === false`: such a list loaded
its first page twice and rendered duplicate keys. A list that had stopped loading at its
end (`hasMore === false`) sent one more request. And the fill call that was requested while
the first page was loading requested one page more than the list needed.

## Migration

Nothing to do. A callback that returns early on flags from its render (`loading`, nothing
more to load) now sees the values of the latest render, and a `loadMoreTop` set to
`undefined` stops the calls right away. A list no longer requests an extra page at the end
of its fill when a page arrives while a fill call is waiting.
