# useLazyCrudConnector's extraParams are a record

- **Date:** 2026-11-26
- **Kind:** type
- **Scope:** `backend-components/Form` (`useLazyCrudConnector`, `UseLazyCrudConnectorParams`, `extractLazyCrudConnectorParams`)

## What changed

The type parameter `ExtraT` of `useLazyCrudConnector`, `UseLazyCrudConnectorParams` and
`extractLazyCrudConnectorParams`, the type of `extraParams`, is constrained to
`Record<string, unknown> | undefined`. `useLazyCrudConnector<string>(…)` no longer compiles.

## Why

Without `getConnector`, `extraParams` goes to the default API connector factory
(`setDefaultConnectorAPI`), which takes a record. Any other type compiled and reached the
factory as something it does not handle.

## Migration

Nothing to do for `extraParams` given as a record or left out.

Required for any app that types `extraParams` as something else: make it a record, e.g.
`{ variant: "x" }` instead of `"x"`. An interface has no index signature and is no
`Record<string, unknown>`: declare the type with `type` instead.
