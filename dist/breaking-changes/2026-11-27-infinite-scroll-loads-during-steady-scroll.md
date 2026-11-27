# InfiniteScroll calls loadMoreBottom during a steady scroll, not only once the scroll stops

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/InfiniteScroll` (and so `Notifications` and `ScrollableSchedule`)

## What changed

Every trigger of a call (a scroll event near an end, the fill check after new `children` or a
size change, focus on the last row) used to restart the `callBackDebounce` wait (100 ms by
default): a burst of triggers resulted in one call, `callBackDebounce` ms after the last of
them. Now the first trigger starts the wait and the triggers that come while it runs join it
without restarting it: the call is made `callBackDebounce` ms after the first of them.

- A steady scroll into the last `threshold` px (250 by default) calls `loadMoreBottom` 100 ms
  after it got there, while the scroll goes on. Before, the call came 100 ms after the scroll
  stopped, which was usually at the very bottom.
- While the triggers go on, the first trigger after a call starts the next wait, so the
  callback is called again every `callBackDebounce` ms: e.g. while a scroll stays within the
  threshold of the bottom during a load, or while a short list gets new `children` every few
  ms. While `loading` is set, no call is made, as before.
- A changed `callBackDebounce` applies to the waits that start after the change; with `0`,
  the next trigger calls at once, as before.

## Why

Every scroll event restarted the wait, so a user who scrolled without pausing reached the end
of the list before the next rows were requested, and the `threshold` only helped users who
paused.

## Migration

Required for any app whose `loadMoreBottom` or `loadMoreTop` starts a load that takes longer
than `callBackDebounce` without passing `loading` and without a guard of its own: pass
`loading` while the load runs. Without it, a scroll that goes on near the end requests the
same page again every `callBackDebounce` ms.

```tsx
const [loading, setLoading] = useState(false);
const loadMoreBottom = useCallback(() => {
	setLoading(true);
	fetchPage(rows.length)
		.then((page) => setRows((prev) => [...prev, ...page]))
		.catch(reportError)
		.finally(() => setLoading(false));
}, [rows.length]);

<InfiniteScroll loadMoreBottom={loadMoreBottom} loading={loading} className={…}>
	{rows.map(renderRow)}
</InfiniteScroll>;
```

`Notifications` takes no `loading`: required for any app that passes `Notifications` a
`loadRead` or `loadUnread` that starts a request on every call: guard it, e.g. set a loading
flag in the callback and start the request in an effect when the flag turns `true`, so that a
call while the flag is set changes nothing.

Callbacks that are guarded already, and callbacks that add their rows synchronously (as
`ScrollableSchedule` does with its weeks), need no change. Tests that count calls during a
burst of scroll events longer than `callBackDebounce`, or that expect the call
`callBackDebounce` ms after the last of them, may need updating.
