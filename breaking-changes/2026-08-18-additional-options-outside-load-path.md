# additionalOptions moved out of the load path

- **Date:** 2026-08-18
- **Kind:** behavior
- **Scope:** `standalone/Selector`, `backend-components/Selector`

## What changed

`additionalOptions` is now a `BaseSelector` prop, applied by the selector itself rather
than produced inside a load handler. Two consequences:

- It is available on **every** selector (`SingleSelect`, `MultiSelect`,
  `MultiSelectWithoutGroup`, and the backend components), not just
  `BackendSingleSelect`.
- The entries are now shown **on an empty query while `lru` or `forceQuery` are active**,
  where they used to disappear.

`MultiSelectWithTags` deliberately omits the prop: it renders two selectors, so which one
the entries would belong to is ambiguous. Absent beats silently ignored.

## Why

`BackendSingleSelect` built the entries inside its `onLoad`:

```ts
const handleLoad = async (search) => {
	const [records, meta] = await model.index({ … });
	const matching = (additionalOptions ?? []).filter(…);
	return { options: [...matching, ...records.map(convert)], … };
};
```

But `BaseSelector` skips `onLoad` entirely on an empty query when `lru` is configured or
`forceQuery` is set. So local entries that need no request at all were gated behind a
request that never happened. The LRU half of this was known and documented on the prop as
`@remarks Has no effect if LRU`; `forceQuery` made it a live problem, since suppressing
the default result set is exactly when a "no filter" / "unassigned" pseudo-entry matters
most.

Pseudo-entries belong next to `onAddNew`, which is applied outside the load path and
therefore always survives.

## Migration

None for `BackendSingleSelect` — same prop name and type, and it now also works in the
cases where it previously did nothing. Drop any workaround that re-added these entries
manually for the `lru` / `forceQuery` case.

The entries are matched against the search query by label and are exempt from group
sorting, so they stay at the top of the list. They are still subject to `filterIds` and
the `hidden` flag.

`BaseSelectorLoadResult.total` reported by the backend selectors is now purely the backend
count — previously `additionalOptions.length` was added to it (and cancelled out against
the loaded count), which no longer happens.
