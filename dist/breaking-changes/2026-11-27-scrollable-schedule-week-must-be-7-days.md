# ScrollableSchedule: a week result that is not 7 days fails the week

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/Schedule` (ScrollableSchedule, `LoadWeekCallback`)

## What changed

`loadWeekCallback` must return (or resolve with) an array of exactly 7 days, each an
array of entries, as its type `IDayData[][]` and its documentation say. Any other result
now fails that week's load, as a rejection does: the week keeps its "Week N, …" line and
shows the alert "Week N could not be loaded" with a Retry button, and below the title the
message of the Error thrown for it, which says what the result was instead:

- fewer or more than 7 days: `ScrollableSchedule: loadWeekCallback must return 7 days, got 5`
- `null` or `undefined`: `… got null`, `… got undefined`
- an object keyed by day instead of an array (`{ 0: [...], …, 6: [...] }`): `… got an object`
- a day that is not an array: `… each an array of entries, got null at index 2`

This holds for a callback that returns its result directly and for one that returns a
promise. The other weeks of the list load and show as before. A week without entries is
7 empty arrays and shows its 7 days, empty.

Before, fewer than 7 days or a day that was not an array crashed the whole schedule up to
the nearest error boundary, `null` or `undefined` left the week on its spinner for good,
days after the 7th were not shown, and an object keyed by day was shown like an array.

## Why

A result in another format is a programming error in the app. Failing the week makes it
visible where it happens, with a message that names the problem, instead of a crash of
the whole view, an endless spinner or silently dropped days.

## Migration

Required for any app whose `loadWeekCallback` can return something other than 7 arrays:
for example a backend response that leaves out days without entries, a response object
keyed by weekday passed on as it is, or `null` for an empty week. Return one array per
day, an empty one for a day without entries:

```ts
const loadWeekCallback: LoadWeekCallback = async (weekOffset, filters) => {
	const response = await fetchWeek(weekOffset, filters);
	// one array per day, in the order of the locale's week
	return Array.from({ length: 7 }, (_, day) =>
		(response.days[day] ?? []).map(toEntry),
	);
};
```

An app whose callback always returns 7 arrays has nothing to change.
