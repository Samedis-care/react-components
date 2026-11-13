# A Form given another record drops the previous page's validation and submit handlers

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `backend-components/Form` (and with it `useLazyCrudConnector`, `FormCrudMultiSelect`, `FormCrudFileUpload`, `FormCrudMultiImage`, `CrudMultiSelect`'s `validate`, nested forms)

## What changed

When a mounted `Form` gets another `id` or `model` and starts over (see
[A Form given another record starts over](2026-11-06-form-record-switch-starts-over.md)), it now
also drops every custom validation, warning, pre-submit and post-submit handler the previous
record's page registered. The page mounted for the new record registers its own.

This matters for handlers that stay registered after their control unmounts, which is what a
hidden control does without `onlySubmitMounted` / `onlyValidateMounted`:

- a lazy control (`useLazyCrudConnector`) with writes queued for the previous record no longer
  sends them to the new record's endpoint when the new record's page does not show the control.
  The queue is dropped, unsent, as it already was when the page shows the control;
- the `validate` of a `CrudMultiSelect` / `FormCrudMultiSelect` no longer checks the previous
  record's selection, and so no longer blocks the new record's save;
- a nested form shown for the previous record only is no longer validated and saved by the new
  record's save;
- a handler an app registers through `setPreSubmitHandler`, `setPostSubmitHandler`,
  `setCustomValidationHandler` or `setCustomWarningHandler` no longer runs for the next record
  unless the new page registers it again.

A create form given the id of the record it has just saved keeps its handlers, as it keeps its
page. A `Form` keyed by its id (`key={id}`, as CRUD does) is not affected: it was already mounted
again for each record.

## Why

A form must validate and save only the record it shows. A handler of the previous record wrote
that record's pending changes into the new one (a lazy control's queue went to the new record's
endpoint), or refused the new record's save with an error the user could not see or fix.

## Migration

Nothing to do. A handler that has to run for every record is registered by a component the page
renders for every record, as before.
