# Connector.deleteMultiple reports which records it could not delete

- **Date:** 2026-10-27
- **Kind:** behavior, type
- **Scope:** `backend-integration/Connector`, `backend-components/FileUpload`

## What changed

There is a new error, `PartialDeleteError`, exported next to `BackendError`. Its
`failedIds` are the ids a `deleteMultiple` call could not delete; every other id of the
call was deleted.

`Connector`'s default `deleteMultiple` still deletes each id through `delete`, but now
waits for all of them:

- If some of them fail, it rejects with a `PartialDeleteError`. Its message is the first
  failure's, and its `cause` is that error.
- If all of them fail, it rejects with the first failure itself.

It used to reject with the first failure as soon as that happened, while the other deletes
were still running.

`CrudFileUpload` reads `failedIds`. With a direct connector, a file whose delete went
through now leaves the list, even when the delete of another file in the same change was
refused. Any other error from `deleteMultiple` still keeps every file of the call listed
as a pending removal, and the next change sends their deletes again. A file whose delete
went through is also no longer deleted a second time by a change the user made while the
request was running. If the user restored it in that time, it still leaves the list,
because it is gone from the server.

## Why

A rejected `deleteMultiple` did not say which records it had deleted. `CrudFileUpload`
kept every file of the call listed as a pending removal, and the next change sent their
deletes again, which a backend refuses for records it no longer has.

## Migration

Code that checks the type of an error from the default `deleteMultiple` gets a
`PartialDeleteError` when only some of the deletes failed. The original error is its
`cause`.

A connector that overrides `deleteMultiple` can throw a `PartialDeleteError` where its
backend reports which records it could not delete. Until it does, `CrudFileUpload` treats
a failed call as having deleted nothing.
