# filterSortPaginate ends a filter chain at its first condition without a value

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `utils/filterSortPaginate`: `filterSortPaginate`, `filterSortPaginate2`

## What changed

A column filter's chain (`nextFilter`) now ends before its first condition without a `value1`,
as in the DataGrid's own query (`fieldFilter` in `loadData`'s parameters). Such a condition used
to be applied and could change the result:

- A chained one replaced the conditions before it:
  `{ type: "contains", value1: "a", nextFilterType: "and", nextFilter: { type: "contains", value1: "" } }`
  returned every row, not only the rows containing "a". Now it returns the rows containing "a".
- A first one was applied as it was: `{ type: "equals", value1: "" }` returned the rows with an
  empty value, `{ type: "notContains", value1: "" }` returned none. Now such a filter filters
  nothing, and the conditions chained after it are ignored too.

`empty` and `notEmpty` conditions carry their type as `value1`
(`{ type: "empty", value1: "empty", value2: "" }`), as the DataGrid's filter popup sets them.
Without it they are ignored like any other condition without a `value1`.

## Why

The DataGrid and the BackendConnectors of samedis.care and identity-management read a condition
without a `value1` as no condition. `filterSortPaginate` now reads a filter the same way, so rows
filtered locally match what a backend returns for the same filter.

## Migration

Nothing to do for a `loadData` that passes the DataGrid's parameters on to `filterSortPaginate`:
they never contain a condition without a `value1`.

Required for a caller that builds the filter itself and filters for an empty value: use the
`empty` type with its magic value instead of comparing with an empty string, or the filter has no
effect.

```ts
// before: matched the rows with an empty name, now filters nothing
fieldFilter: { name: { type: "equals", value1: "", value2: "" } }
// after
fieldFilter: { name: { type: "empty", value1: "empty", value2: "" } }
```
