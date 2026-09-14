# Queued deletes stay deleted, and pending file changes survive a remount

- **Date:** 2026-09-14
- **Kind:** behavior
- **Scope:** `backend-integration/Connector`, `backend-components/FileUpload`

## What changed

### `LazyConnector.index`

A record whose delete is queued is now actually dropped from the index result. The
enhancement pass computed the filtered list and discarded it, so every reader — data
grids, file uploads, anything listing through a lazy connector — kept showing records the
queue was about to delete.

`totalRows` and `filteredRows` now follow the rows out, the same way a queued create
already added to them.

`LazyConnector.getQueuedDeleteRecords()` hands those records back, since nothing else
can: `index` no longer lists them and `read` throws for them. A record is remembered from
the index call which hid it, and forgotten when its entry leaves the queue — so working
the queue, or cancelling the delete, drops it without anything else having to.

### `CrudFileUpload`

A file removed while the connector queues writes is shown struck through with a restore
control until the form submits. Two changes to that:

- Once the queue has been worked, the file **leaves the list** rather than only losing its
  mark.
- The marks now **survive the control being unmounted and mounted again** — a language
  switch, a route change, a tab. They are read back off the connector's queue, which is
  what outlives the control: a queued upload comes back marked as added, a queued removal
  as removed and restorable. A restored file is listed at the end rather than in its
  original position, which is all the index result can say about it.

Removing a file while another one is still uploading no longer uploads that one a second
time. The list handed to the control's change handler comes from the standalone control,
which keeps its own copy of a picked file until the upload's result reaches it, so a change
made in between handed the picked file back unchanged. Changes are now applied one after
the other, and each picked file is uploaded once.

## Why

A removed file came back after saving looking like an ordinary file: not struck through,
no restore control, nothing to say it was already gone. Removing it a second time sent the
same `DELETE` for an id the backend no longer had, which answers 404.

## Migration

Nothing to do.
