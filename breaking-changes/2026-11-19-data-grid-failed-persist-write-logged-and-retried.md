# A data grid logs a failed write of its persisted state and writes it again

- **Date:** 2026-11-19
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (`DataGridPersistentStateContext`, `DataGridStorageManagerPersist`)

## What changed

A grid handles a failure of the persistence setter: a setter that throws, or returns a promise
that rejects.

- The error is logged to the console (`[Components-Care] [DataGrid] Persist:`). It used to be
  an unhandled promise rejection, which the apps' error reporting picked up; a setter that
  threw broke the grid.
- The grid calls the setter again with its next state update (a page of rows loaded, a
  selection, a change), with its current data, whether that changed or not. It used to call
  the setter again only once the persisted data changed.

`DataGridStorageManagerPersist` writes each of its two buckets whether the other one can be
written or not. Its setter settles once both writes are done, and rejects when one failed with
an `Error` naming the bucket and the storage keys, whose `cause` is what the storage threw or
rejected with; when both failed, with an `AggregateError` of the two. It used to reject with
the storage's own error as soon as one bucket failed.

## Why

While a server storage failed, every change of a grid (each step of a column resize) was an
unhandled rejection, and the change was not written again until the next one, even once the
server was back.

## Migration

Nothing to do in the apps: they use `DataGridStorageManagerPersist`, and their storage
providers keep throwing or rejecting on a failed write.

A custom persistence provider (one that provides `DataGridPersistentStateContext` itself)
should throw or reject when the data could not be stored, so the grid writes it again; it may
be called with the same data again after a failure.
