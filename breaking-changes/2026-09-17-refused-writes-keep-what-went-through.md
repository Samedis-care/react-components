# A refused write no longer takes the ones beside it

- **Date:** 2026-09-17
- **Kind:** behavior
- **Scope:** `backend-integration/Connector`, `backend-components/FileUpload`

## What changed

### `LazyConnector.workQueue`

A submit still stops at the write the backend refuses and still throws, so the form can
report it and let the user put it right. What changed is the queue it leaves behind: only
the writes which were actually sent are dropped from it. The one which was refused stays,
together with everything queued behind it, and a retried submit sends exactly that.

Previously the queue was emptied on the way out, which a failure never reached, so the
whole queue survived — and a retry re-sent every write that had already gone through,
creating a second record for each.

Two smaller consequences of the same change: writes queued while the submit was running
are no longer discarded with the rest, and the queue change listeners are notified after a
failed submit too, so anything rendering pending state sees what is left.

### `CrudFileUpload`

Each write in a change is now accounted for on its own:

- An upload which went through is kept and remembered even when another upload, or the
  delete, in the same change was refused. Previously the first failure threw away the
  results of everything beside it; because the list the control is handed back still
  contains the picked files, the next change uploaded them again, leaving a second copy on
  the server — and again for every change after that.
- An upload the server refuses **leaves the list**, and the error is reported as before.
  It was never on the server, and a file left in the list is uploaded again by the next
  change.
- A delete the server refuses leaves the file in the list, still marked for removal, for
  the next change to try again.

A file's pending mark is now read from the connector queue rather than from the list the
change started with, so a change which cancels the last queued write no longer puts a
stale mark back after the marks were cleared.

## Why

Duplicate records. Every path above ended with the same file being written to the backend
twice: once when it went through, once when something else failed and the control or the
queue offered it again.

## Migration

Nothing to do. An application which relied on a refused upload staying in the list has to
let the user pick the file again instead.
