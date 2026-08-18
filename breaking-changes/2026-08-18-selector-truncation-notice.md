# Backend selectors show a truncation notice by default

- **Date:** 2026-08-18
- **Kind:** behavior
- **Scope:** `backend-components/Selector`, `standalone/Selector`

## What changed

When a data source reports that it returned fewer records than matched the query, the
dropdown now renders an extra non-selectable entry at the end of the option list — after
the options, above the "add new" button when there is one — using the same small,
muted typography as the LRU label:

> Showing first 25 of 312 results – refine your search

All backend selectors report this automatically, derived from the
`meta.filteredRows ?? meta.totalRows` of their `model.index()` call:

- `BackendSingleSelect`
- `BackendMultiSelect`
- `BackendMultipleSelect`
- `BackendMultiSelectWithTags` (both the group and the data selector)
- and therefore `CrudMultiSelect`, `CrudMultiSelectWithGroups`,
  `GridSingleSelectFilterBackend`, `GridMultiSelectFilterBackend`

Selectors over a local dataset (`selectorLocalLoadHandler`, the enum renderers,
the non-backend DataGrid filters) return plain arrays, report no truncation, and are
unchanged.

New API: `BaseSelectorLoadResult.total`, the `disableTruncationNotice` and
`truncatedLabel` props, and the `standalone.selector.base-selector.truncated`
translation key.

## Why

A selector that silently shows the first 25 of 312 matches reads as "these are all
the options". Per-site `forceQuery` was the workaround, but it is a policy decision
that is wrong for small fixed lists. Surfacing the truncation is self-limiting — it
only appears when a source actually truncated — so it fixes the whole class of
problem without the collateral damage.

## Migration

Nothing is required. Expect the footer in screenshots and visual regression baselines
for any backend selector whose result set is limited.

To opt out for one instance:

```tsx
<BackendSingleSelect {...props} disableTruncationNotice />
```

Or library-wide via theme, per selector type:

```ts
createTheme({
	components: {
		CcBackendSingleSelect: { defaultProps: { disableTruncationNotice: true } },
	},
});
```

To change the wording, pass `truncatedLabel`, which also lets you render a node rather
than a string:

```tsx
<BackendSingleSelect
	{...props}
	truncatedLabel={(loaded, total) => `${loaded} of ${total} — narrow it down`}
/>
```

It is an ordinary `isSmallLabel` option entry, so it picks up the existing `smallLabel`
slot of `CcBaseSelector` for styling. No new class keys were added.

One ordering change came with it: the "add new" entry and its divider are now appended
**after** group sorting instead of before. Previously, with `grouped` enabled, the sort
could move the add-new button into the middle of the list; it is now always last.

Note that `disableTruncationNotice` does not replace `forceQuery`. The notice makes a
default, unfiltered result set _honest_; `forceQuery` stops it from being loaded at
all. For large backends both are still worth setting.
