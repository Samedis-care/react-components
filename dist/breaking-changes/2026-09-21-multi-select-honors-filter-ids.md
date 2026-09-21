# Multi selects honor filterIds and refreshToken

- **Date:** 2026-09-21
- **Kind:** behavior
- **Scope:** `standalone/Selector`, `backend-components/Selector`

## What changed

`filterIds` passed to a multi select is no longer discarded. The ids the caller
wants kept out of the options are now filtered **in addition to** the entries that
are already selected, instead of being replaced by them.

The same applies to `refreshToken`: a caller supplied token is now part of the
token the inner selector sees, so it reloads the options both when the selection
changes and when the caller's token changes.

Affected components — everything that drives `BaseSelector` as a tag picker:

- `MultiSelect`
- `MultiSelectWithoutGroup`
- `MultiSelectWithTags` — it accepts `filterIds` through
  `MultiSelectWithoutGroupProps` and now forwards it to the data selector (the
  group selector is unaffected)
- `BackendMultiSelect`, `BackendMultiSelectWithTags` and the
  `ModelDataTypeBackendMultiSelectRenderer` /
  `ModelDataTypeBackendMultiSelectWithTagsRenderer` form fields built on them,
  which forward the prop

Single selects (`BaseSelector`, `SingleSelect`, `BackendSingleSelect`) are
unchanged — they always read `filterIds`.

## Why

Consumers need to exclude specific records from a multi select's options on top of
the current selection, and there is not always a server side filter for it. The
concrete case
([samedis-care-issues#2981](https://github.com/Samedis-care/samedis-care-issues/issues/2981))
is a catalog placeholder record ("No device model specified") that the backend
rejects: it had to be hidden from the picker, but the prop that hides it only
worked on single selects. Both props type-checked all the way down and then did
nothing, because the inner selector was rendered with the caller's props spread
first and `filterIds` / `refreshToken` set unconditionally after.

## Migration

Nothing to change for callers that pass neither prop — the selected entries are
still filtered out of the options, and the list still reloads when the selection
changes.

Callers that already pass `filterIds` or `refreshToken` to a multi select get what
the prop says. Review them: a `filterIds` that was written for a single select and
copied to a multi select now actually removes those entries from the options, and
an unstable `refreshToken` (a new value on every render) now reloads the options
on every render. Memoize such a value, or drop the prop.
