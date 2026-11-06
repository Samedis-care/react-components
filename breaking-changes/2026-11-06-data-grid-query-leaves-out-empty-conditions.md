# The DataGrid query leaves out empty filter conditions

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (`fieldFilter` in `loadData`'s parameters, `getQuery()`, the
  filter `onDelete` and custom data action buttons get, exporters' `onRequest`, the pages the
  limited select all loads)

## What changed

A column filter's chain (`nextFilter`) now ends before its first condition without a `value1`.
Such a condition appears when the user picks the type of the second condition in a column's
filter popup, or types into it and clears it again. The grid used to pass it on as it was, e.g.
`{ type: "contains", value1: "a", nextFilterType: "and", nextFilter: { type: "contains", value1: "" } }`;
now that filter arrives as `{ type: "contains", value1: "a", nextFilterType: "and", nextFilter: undefined }`.

## Why

The grid does not reload for an empty condition, because it has no effect on the result. The
pages loaded afterwards (while scrolling, after a search, for a delete or an export) still got
it, so one list could be loaded with two different queries. `filterSortPaginate`, for example,
let an empty second condition replace the first one, and those pages showed rows the column
filter excludes.

## Migration

Nothing to do. A `loadData` that skipped conditions without a `value1` (as the BackendConnectors
of samedis.care and identity-management do) gets the same result as before.
