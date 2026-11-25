# A signature field's label is a `<label>`, not a `<legend>`

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `ModelDataTypeSignatureRenderer`

## What changed

In a Form, the label above an editable signature field is a `<label>` element, MUI's
`FormLabel` with its default element, instead of a `<legend>`. It keeps its id
`<id>-label`, its classes (`MuiFormLabel-root` and the state classes) and its look, and it
still names the field's button.

## Why

A `<legend>` only names the `<fieldset>` it opens. The signature field's legend sat in a
`<div>`, so it named no group. The field is a single control, named by its label, like
MUI's own fields.

## Migration

Nothing to do for most apps. **Required for** theme overrides, CSS and tests that select a
signature field's label as a `legend` element: they no longer match it. Select it as
`.MuiFormLabel-root` inside the field, or by its id `<id>-label`, instead.
