# The multi selects sort a copy of the selection, and report it in the caller's order

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Selector`

## What changed

`MultiSelect`'s `selectedSort` and `MultiSelectWithoutGroup`'s `sortCompareFn` (which
`MultiSelectWithTags` passes on) now sort a copy of `selected` for display. They used to
sort the `selected` array itself while rendering.

- The entries are listed in the same order as before.
- The caller's `selected` array keeps its order.
- `onSelect` (`onChange` in `MultiSelectWithTags`) reports the entries in the caller's
  order: a pick or a group pick appends to it, and a removal leaves the other entries
  where they were. It used to report them in the sort order, because the caller's array
  had been sorted in place.
- A frozen `selected` array (`Object.freeze`, Immer state) renders. With a sort set, it
  used to throw `TypeError: Cannot assign to read only property '0'`.

This applies to everything built on these components, among them `BackendMultiSelect`,
`CrudMultiSelect`, the enum multi select renderer, `BackendMultiSelectWithTags` and
`CrudMultiSelectWithGroups`.

## Why

The sort is meant for the view only, as its documentation said. Sorting the caller's array
changed the parent's state without telling it, and every edit rewrote the stored order to
the sort order. A form compares a field's value in order, so adding an entry and removing
it again left the field dirty when the stored order was not the sort order.

## Migration

Nothing to do for code that stores what `onSelect` reports. Code that relied on the
reported selection being sorted has to sort it itself before storing it.
