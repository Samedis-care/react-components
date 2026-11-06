# CRUD selects keep their field while the selection loads and after the load failed

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `backend-components/Selector` (`CrudMultiSelect`, `CrudMultiSelectWithGroups`,
  and so `FormCrudMultiSelect`)

## What changed

While the selected entries are loading, the field is shown with its label, disabled, and
marked `aria-busy="true"`. A "Loading…" status line is shown under it. Before, a spinner
replaced the whole field.

When the load fails, the field stays, disabled, with an alert under it that names the
field: "Members could not be loaded.", or "The selected entries could not be loaded." for a
field without a label. Before, the error's message replaced the field, untranslated and
without a label (e.g. `403 Forbidden: actors.reader missing`). The error now goes to the
console (`console.warn`) instead.

A CrudMultiSelect's `endAdornment` and `endAdornmentLeft` are rendered once the selection
is loaded, as before. While it loads, and after a failed load, the field has no end
adornments.

The field is now wrapped in a `div` that carries `aria-busy`. The status and alert lines
come after that `div`.

New translation keys: `backend-components.selector.selection-load-error`,
`backend-components.selector.selection-load-error-unlabelled`.

## Why

The form's layout jumped while the selection loaded. Screen readers met an unnamed
progress bar there, and after a failure they met a bare text that was not a form field.
A failed load showed a technical English message, and nothing announced it.

## Migration

Nothing required. A test or a page that waited for a CrudMultiSelect's or a
FormCrudMultiSelect's combobox to appear has to wait until it is enabled instead. One
that looked for the error's message in the page has to look for the translated alert.
