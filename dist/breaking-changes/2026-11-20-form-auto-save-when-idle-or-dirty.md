# FormAutoSave also saves when the form turns idle or dirty

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `backend-components/Form` (`FormAutoSave`)

## What changed

`FormAutoSave` looks again whenever the form turns idle or dirty, not only when its values
change:

- A change made while the form is busy (a busy reason from `addBusyReason`, or a save in
  progress) is saved once the form is idle again. Before, it stayed unsaved until the next
  change.
- A save whose pause ends while the form is busy waits until the form is idle, then for
  `debounceTime` again. Before, it saved while the form was busy.
- A form that turns dirty without a change of its values, through `setCustomFieldDirty`, is
  saved: a nested form with changes, or the queued writes of `FormCrudMultiSelect`,
  `FormCrudFileUpload` and `FormCrudMultiImage`. Before, it was never auto-saved.
- A save that failed is not started again for the same values, also when the values are
  changed and then changed back to them; the next change to other values is saved.

## Why

A change made while the form was busy was skipped and not looked at again, so the form stayed
dirty and unsaved until the user changed something else. A form dirty only through a custom
field has no change of its values, so it was never saved. A failed save leaves the form dirty
and idle, and looking again on idle would repeat it in a loop, hence the rule for failed saves.

## Migration

Nothing to do. A form with `FormAutoSave` that holds a nested form or one of the controls above
is now saved by itself when only those have changes, and that save sends them as a save button
would.
