# Model cacheOptions: cacheTime is gcTime

- **Date:** 2026-09-29
- **Kind:** type
- **Scope:** `backend-integration/Model` (`CacheOptions`, the `cacheOptions` of `ModelOptions`)

## What changed

`CacheOptions.cacheTime` is renamed to `gcTime`, the name react-query uses since v5. The model
hands its `cacheOptions` to react-query as they are, so `gcTime` now sets how long unused data
stays cached, e.g. `{ cacheOptions: { gcTime: 0 } }` for a model whose data must never show
again once nothing uses it.

## Why

react-query v5 ignores `cacheTime`. A model that set it kept react-query's default of 5
minutes, and `CacheOptions` didn't accept `gcTime`.

## Migration

Rename `cacheTime` to `gcTime` in `cacheOptions`. The value already had no effect, so the
rename makes it apply for the first time: check that the time is still what you want.
