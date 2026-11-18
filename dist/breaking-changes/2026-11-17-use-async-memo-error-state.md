# useAsyncMemo returns `{ value, error }`, and a failing factory sets `error`

- **Date:** 2026-11-17
- **Kind:** type, behavior
- **Scope:** `utils/useAsyncMemo`, `utils/useAsyncCache`

## What changed

`useAsyncMemo(factory, dependencies, keepPreviousResult)` returns an object
(`UseAsyncMemoResult<T>`) instead of the value itself:

- `value`: what the factory resolved to for the current dependencies, `null` while it runs
  and after it failed (with `keepPreviousResult`, the last result stays in place of that
  `null`). This is what the hook returned before.
- `error`: why the factory failed for the current dependencies, as an `Error`: the reason
  it rejected with, or what it threw. A reason that is not an `Error` is wrapped in one,
  with the reason as its `cause`. `null` while the factory runs and once it resolved; it is
  cleared when the dependencies change, which runs the factory again.

`useAsyncCache` returns `{ value, error, reset }` (`UseAsyncCacheResult<T>`): `error` is new
and works the same way, and `reset` also runs a factory again that failed.

A rejection is handled by the hook. It used to be an unhandled promise rejection, and the
value stayed `null` until the dependencies changed. A rejection for dependencies that
changed while the factory ran is dropped, like its result.

## Why

A caller that shows a loader while the value is `null` kept loading for good when the
factory failed (a failing request, offline), and nothing told the user. The failure only
showed up as an unhandled rejection in the console and the error reporting.

## Migration

**Required for every call of `useAsyncMemo`:** read the value from `.value`.

```ts
// before
const quota = useAsyncMemo(() => loadQuota(), [version]);
// after
const { value: quota, error: quotaError } = useAsyncMemo(() => loadQuota(), [version]);
```

Search for every call rather than relying on type errors: some uses of the old return value
still compile with the object and are then always truthy, for example
`useAsyncMemo(…) ?? false`, `useAsyncMemo(…) || fallback` and `if (useAsyncMemo(…))`.

**Required for a caller whose factory can fail (a request, a storage read, a dynamic
import) and which shows a loader or nothing while the value is `null`:** show `error`
instead, for example the error message with a way to try again (change the dependencies,
or call `reset` of `useAsyncCache`). Without it, the user still waits for a value that
never comes; the failure is no longer reported as an unhandled rejection either. A caller
that has a fallback for a missing value (for example "no camera") can keep using it and
ignore `error`.

`useAsyncCache` callers need no change to keep working; show `error` as above.
