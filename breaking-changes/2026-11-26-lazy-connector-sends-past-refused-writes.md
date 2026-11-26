# A refused write no longer stops a LazyConnector's queue, and the error names what was refused

- **Date:** 2026-11-26
- **Kind:** behavior, type
- **Scope:** `backend-integration` `LazyConnector.workQueue`; `FormCrudMultiSelect`,
  `CrudMultiSelect`, `CrudMultiSelectWithGroups` and every control on `useLazyCrudConnector`

## What changed

`LazyConnector.workQueue`, which a Form's save calls for every lazy control (through
`useLazyCrudConnector`), no longer stops at the first create or update the backend refuses:

- The creates and updates queued after a refused write are sent. Only the refused writes stay
  queued, so the Form stays dirty and the next save sends them again.
- The deletes queued after a refused write are not sent. They stay queued (a removed entry
  stays listed as removed) and go with the next save in which the writes before them went
  through.
- A refused delete is still dropped, as before.

What `workQueue`, and with it the Form's submit, rejects with when writes were refused:

- While a `CrudMultiSelect` or `CrudMultiSelectWithGroups` (also inside `FormCrudMultiSelect`)
  is mounted on the connector: a `PartialApplyError` with one failure per refused write (the
  selector entry, the action `create` or `update`, and the backend's error), whose message
  names each by its entry's label, e.g. "Frank Wilson: Person 6 is archived", several joined
  with "; ". This is the error the selector reports for a refused write through any other
  connector. The Form's error component shows it.
- Otherwise (`FormCrudFileUpload`, `FormCrudMultiImage`, a connector used by hand): the
  backend's error itself when one write was refused, as before; an `AggregateError` of all of
  them when several were, whose message joins theirs with "; ".

New: `LazyConnector.setQueueErrorFactory(factory)` lets the control that lists the records make
that error from the refused writes (`QueuedWriteFailure[]`: the record's id as `index` hands it
out, `create` or `update`, and the error). Both types are exported from the package root.

## Why

A save stopped at the first refused write: the writes queued after it were never tried, and
the error was the backend's message alone, which did not say which of the entries it was. The
user could not tell what was saved, and every retry failed at the same entry until the user
guessed which one to remove. Now one save sends everything it can and names every refused
entry.

Deletes wait because a delete can be the second half of a replacement: `FormCrudFileUpload`
queues the upload of a file picked again under its name, then the delete of the old file. If
the upload is refused, the old file has to stay.

## Migration

**Required for any app that inspects the error of a Form's submit, or of `workQueue`, for the
backend's error (its class, `name`, `code` or `meta`) in a form with a lazy control**
(`FormCrudMultiSelect`, `FormCrudFileUpload`, `FormCrudMultiImage`, or a control of its own on
`useLazyCrudConnector`). A refused write of the queue now arrives inside a
`PartialApplyError` or an `AggregateError` when it comes from a selector or when several were
refused; reading the error itself misses it. Read the refusals out of it:

```ts
import { isPartialApplyError } from "components-care";

/** the backend errors of a failed submit */
const refusalsOf = (e: unknown): unknown[] => {
	if (e instanceof Error && isPartialApplyError(e))
		return e.failures.map((failure) => failure.error);
	if (e instanceof AggregateError) return e.errors;
	return [e];
};

try {
	await submit();
} catch (e) {
	if (refusalsOf(e).some((refusal) => isLockedError(refusal))) {
		// …
	}
}
```

An app that wraps `workQueue` (to act once the queue was sent) gets the writes after a refused
one sent before the wrapped call rejects; nothing to change unless the wrapper relied on
nothing being sent after a refusal.

An app with a control of its own on a `LazyConnector` can name the refused records the way the
control lists them:

```ts
useEffect(
	() =>
		connector.setQueueErrorFactory((failures) =>
			new Error(
				failures
					.map((failure) => `${nameOf(failure.id)}: ${failure.error.message}`)
					.join("; "),
			),
		),
	[connector],
);
```
