# semaphoreExec returns executor errors instead of rejecting

- **Date:** 2026-10-13
- **Kind:** behavior
- **Scope:** `utils/semaphoreExec`

## What changed

`semaphoreExec` runs every record and resolves to `[results, errors]`, also when executors
fail. A failed record's error is in `errors` at the record's index, and its `results` entry
is `undefined`.

It used to reject with the first executor error. Records that had not started by then were
never run, and records that were still running finished in the background without a way to
see their results. An executor that throws instead of returning a rejected promise is handled
the same way.

## Why

This is what the function documents. On a rejection, the caller could not tell which records
had been processed.

## Migration

Check `errors` for the failed records: code that relied on the rejection to notice a failure
now gets a resolved promise. Code that already checks `errors` needs no change; a `catch`
around the call is only reached when `progressCb` throws.
