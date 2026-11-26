# CachedServerStorageProvider answers a fresh cached value synchronously

- **Date:** 2026-11-26
- **Kind:** type, behavior
- **Scope:** `framework/Storage` (`CachedServerStorageProvider`, `StorageManager`), `standalone/DataGrid` (`DataGridStorageManagerPersist`)

## What changed

- `CachedServerStorageProvider.getItem` returns `string | null | Promise<string | null>`, no longer
  `Promise<string | null>`. A value its cache holds fresh (read or written within
  `cacheOptions.staleTime`, 5 minutes by default, and not invalidated since) is returned
  synchronously. A value that is stale, invalidated or not cached is read from the server through a
  promise, as before.
- `StorageManager.getItem` returns what the provider answers, so for a key routed to a
  `CachedServerStorageProvider` it returns a fresh value synchronously too.
- `DataGridStorageManagerPersist` reads a synchronous answer while it renders. A grid whose buckets
  the provider's cache holds fresh (on the next visit to its page within the stale time, or after
  the grid wrote them) opens in the first render, without a Loader in its place.

## Why

A grid whose state is stored on a server showed a Loader for a moment on every visit, also when the
provider had its state in the cache, because the provider answered through a promise even then.

## Migration

- Nothing to do for an app that reads through `await StorageManager.getItem(...)` or
  `await provider.getItem(...)`, or only routes keys to a `CachedServerStorageProvider` subclass:
  `await` takes both kinds of answer.
- Required for any app that uses the result of a `CachedServerStorageProvider`'s `getItem` as a
  promise (`.then`, `.catch`, `.finally`, `Promise.race`), or that overrides `getItem` in a subclass
  with a `Promise` return type and returns `super.getItem(key)` from it: `await` the result, or wrap
  it in `Promise.resolve`. Without it, the code no longer compiles, and plain JavaScript fails on a
  fresh value (a string or null has no `.then`).

  ```ts
  // before
  provider.getItem(key).then(apply);
  // after
  apply(await provider.getItem(key));
  // or
  void Promise.resolve(provider.getItem(key)).then(apply);
  ```

- Expect no Loader in a grid's place on a repeated visit within the stale time: an app test or
  screenshot that waits for the Loader on such a visit no longer finds it.
