# CrudFileUpload and CrudMultiImage call onChange only when their list changes

- **Date:** 2026-10-28
- **Kind:** behavior
- **Scope:** `backend-components/FileUpload`

## What changed

`onChange` used to be called on mount with an empty list, before the connector was loaded,
and again whenever the handler passed was a new function, with the unchanged list.

Now it is called with the loaded list, and after that whenever the list changes. It is no
longer called:

- before the load (a `CrudFileUpload` without a connector still reports its empty list
  once);
- after a failed load;
- because the handler alone changed. The handler passed last is the one called.

## Why

A field that has files first reported none, so owners deriving "has files" from it saw
`false` before `true`. An inline handler that stores a derived list re-rendered the owner,
which passed a new handler, which was called again: the owner rendered without end.

## Migration

None needed for handlers that only react to the list. Code that relied on the empty
report before the load, or on a call after a failed load, has to set its initial state
itself.
