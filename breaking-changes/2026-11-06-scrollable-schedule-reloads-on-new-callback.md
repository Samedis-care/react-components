# ScrollableSchedule reloads its weeks when `loadWeekCallback` changes

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Schedule`

## What changed

When ScrollableSchedule is passed a new `loadWeekCallback` function, it calls the new
function for every week in the list. Each week keeps its rows until the new result
arrives, so the list keeps its weeks and its scroll position. A result or error of the
previous function that arrives later is ignored. Until now the weeks already in the list
kept the data of the function they were first loaded with, and only weeks added later
used the new one.

The internal `ScrollableScheduleWeek` (reachable only by a deep import) takes
`weekOffset`, `today`, `loadWeekCallback` and `filterValues` in place of `moment` and
`loadData`.

## Why

One list showed the data of two functions at once, e.g. the weeks loaded for the
previous tenant above the weeks loaded for the current one, and only a remount loaded
the shown weeks again. WeeklySchedule already reloads when its `loadData` changes.

## Migration

Required for apps that pass a new `loadWeekCallback` on every render (an inline
function, or a `useCallback` whose dependencies change on every render): memoize it with
the dependencies that select the data. Without that, every render of the parent reloads
every week in the list.

```tsx
const loadWeek = useCallback(
	(weekOffset: number, filters: Record<string, string | boolean>) =>
		api.loadWeek(tenantId, weekOffset, filters),
	[tenantId],
);

<ScrollableSchedule wrapperClass={wrapperClass} loadWeekCallback={loadWeek} />;
```

An app that remounts ScrollableSchedule with a new `key` only to reload it can drop the
`key`: passing the new function reloads the list and keeps the scroll position.
