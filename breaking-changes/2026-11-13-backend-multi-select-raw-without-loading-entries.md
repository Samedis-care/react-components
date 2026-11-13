# The backend multi selects leave "Loading…" entries out of raw

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `backend-components/Selector` (`BackendMultiSelect`, `BackendMultipleSelect`,
  `BackendMultiSelectWithTags`, `useSelectedCache`, `useCrudSelect`, and so also
  `GridMultiSelectFilterBackend`, `CrudMultiSelect` and `CrudMultiSelectWithGroups`)

## What changed

While the record of a selected id loads, the field lists it as "Loading…". That entry was
handed back with the next pick or removal like any other, so `onSelect` (`onChange` in
`BackendMultiSelectWithTags`) reported `{ value, label: "Loading…" }` in `raw` as if it
were the record's entry.

Now `raw` holds only real entries: an id whose record is still loading is in the ids, but
has no entry in `raw`. `raw` can therefore be shorter than the ids. A "Loading…" entry
handed back after its record loaded also no longer replaces the loaded entry: a group pick
in `BackendMultiSelectWithTags` that finished after the record loaded left it "Loading…"
for good.

`useCrudSelect`'s `handleSelect`, which `CrudMultiSelect` and `CrudMultiSelectWithGroups`
pass as that handler, keeps the current entry of an id that is in `ids` but missing from
the entries, in its place: no update and no removal for it.

## Why

An app that stores labels or other fields from `raw` stored "Loading…" for the record,
with nothing that told it from a record of that name. `CrudMultiSelect` and
`CrudMultiSelectWithGroups` wrote it: a pick or removal made while an entry was still
"Loading…" updated that entry's row from the placeholder, which has none of the row's
fields.

## Migration

Code that pairs the ids with `raw` by position must match the entries by `value` instead;
an id without entry is still loading. A direct caller of `useCrudSelect`'s `handleSelect`
that removes an entry leaves out its id as well as the entry.
