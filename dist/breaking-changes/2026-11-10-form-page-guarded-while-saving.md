# A dirty form page still asks before it is left while it saves

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `backend-components/Form/BasicFormPage`, and the pages built on it
  (`DefaultFormPage`, `EditOnlyFormPage`, `FlowEngineFormPage`, every CRUD record page),
  in a page and in a `FullFormDialog`

## What changed

A save makes the form read-only (`readOnlyReasons` gets the key
`FORM_SUBMITTING_READ_ONLY_REASON`, `"submit"`), and so does a busy reason
(`addBusyReason`). A form page used to drop its leave guards whenever its form was
read-only, so they were off for as long as a save ran. Now a form page keeps them while
it saves or is busy, and releases them once the form is clean:

| While a dirty form page saves                     | Before | Now                     |
| ------------------------------------------------- | ------ | ----------------------- |
| Escape, a backdrop click or X on a FullFormDialog | closes | asks "Leave form page?" |
| A navigation (link, browser Back)                 | leaves | asks                    |
| Closing the browser tab                           | leaves | the browser asks        |
| The footer's `customProps.goBack`                 | leaves | asks                    |

A form that is read-only for another reason (any other key in `readOnlyReasons`, the
`readOnly` prop, a CRUD without edit permission) still takes no guard, also while it is
busy.

`FORM_SUBMITTING_READ_ONLY_REASON` is new and exported from the package root.

## Why

A save can fail. A form page closed while its save was pending could not show the
failure, so the user believed the edits were saved. Now the user is asked first, and
"No" keeps the form, which shows the save's outcome.

## Migration

Nothing to do for code that navigates once `submit`/`safeSubmit` has resolved or from the
Form's `onSubmit` (as CRUD does): the form is clean by then and nothing asks. Code that
navigates while the save is still running, e.g. without awaiting `submit`, now gets the
prompt while the form has unsaved changes; await the save first.
