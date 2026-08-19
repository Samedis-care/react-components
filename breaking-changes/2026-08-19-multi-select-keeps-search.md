# Multi select keeps the search query while selecting

- **Date:** 2026-08-19
- **Kind:** behavior
- **Scope:** `standalone/Selector`, `backend-components/Selector`, `standalone/DataGrid`

## What changed

Selectors that select multiple records at once no longer throw the search away every
time a record is picked. Typing `berry`, selecting `Strawberry` and then selecting
`Blueberry` from the still-filtered list now works; before, the second selection needed
the query to be typed again because the list had reset to the unfiltered result set.

This affects everything that runs `BaseSelector` with `multiple`:

- `BaseSelector multiple`
- `BackendMultipleSelect`
- `GridMultiSelectFilter` and `GridMultiSelectFilterBackend` (the filter bar variant)

The query is still cleared where that is the expected behavior:

- single select — the input shows the label of the selected record, as before
- leaving the field (blur), the clear button, and creating a `freeSolo` entry
- the tag pickers (`MultiSelect`, `MultiSelectWithoutGroup`, `MultiSelectWithTags`,
  `BackendMultiSelect`, and therefore the filter **dialog** variant of
  `GridMultiSelectFilterBackend`) — they drive `BaseSelector` in single mode and close
  the dropdown on select, so they are unchanged

Two related changes came with it:

- After a selection change the option list is reloaded with the **active query** instead
  of an empty one, so the dropdown keeps matching what the input shows.
- Each keystroke now triggers one load instead of two. The second one searched for the
  raw input value, which in multi mode includes the labels of the already selected
  records (`Strawberry berry`), so it never matched anything and its result was
  discarded anyway.
- `useSelectedCache` returns a referentially stable `selected` array. It previously
  built a new array on every render, which made MUI reset the input — a filter bar
  re-render while the user was typing wiped the query.

## Why

Reported as [samedis-care-issues#2543](https://github.com/Samedis-care/samedis-care-issues/issues/2543):
picking several teams in a data grid filter meant retyping the search for each one.

MUI's `Autocomplete` resets its input whenever its value changes, and in `multiple` mode
that reset is always to the empty string — it assumes the selection is rendered as chips
next to the input rather than as text inside it. Our multi mode renders the labels into
the input and uses the rest of it as the search field, so that reset (plus an explicit
`setQuery("")` on select) destroyed the search on every click. Selecting multiple records
from one search is the whole point of a multi selector, so the reset is now ignored in
that mode.

## Migration

Nothing to do. Expect the search text and the filtered dropdown to survive a click in
multi selectors — visual regression baselines that captured the reset list after a
selection need to be re-recorded.
