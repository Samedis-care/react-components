# LazyConnector: `read` of a record whose delete is queued rejects instead of throwing

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `backend-integration` `LazyConnector.read`

## What changed

`LazyConnector.read` of a record whose delete is queued (through `delete` or `deleteMultiple`)
now returns a rejected promise, with the same error as before ("data has been deleted"). Before,
it threw synchronously, before returning anything.

Every other failure of `read` (a record that is not there, a backend refusal) already rejected,
so `read` now fails the same way in every case.

## Why

A caller that handled the failure on the returned promise, `lazy.read(id).catch(…)` or
`Promise.resolve(lazy.read(id)).catch(…)`, missed the synchronous throw: it escaped the caller
instead. A caller that awaits `read` inside `try`, as `Model` does, saw both alike.

## Migration

Nothing required for a caller that awaits `read` inside `try`/`catch`, or handles the returned
promise's rejection; every model does.

Required for any app that calls `LazyConnector.read` directly and catches the queued delete
with a synchronous `try`/`catch` around a call it does not await: await the call, or handle the
rejection, otherwise the error is an unhandled rejection.

```ts
try {
	const [record] = await lazy.read(id, model);
} catch (e) {
	// also reached for a record whose delete is queued
}
```
