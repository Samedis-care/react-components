# A disabled CrudMultiSelect takes no writes, also from its ref or an end adornment

- **Date:** 2026-11-06
- **Kind:** behavior, type
- **Scope:** `backend-components/Selector` (`useCrudSelect`, and with it `CrudMultiSelect`, `CrudMultiSelectWithGroups`), `backend-components/Form/CrudControls` (`FormCrudMultiSelect`)

## What changed

While the control is disabled, which `FormCrudMultiSelect` also is in a read-only Form and
during a save, nothing writes its selection any more:

- **`addToSelection`** (the ref) rejects with an error and adds nothing, for an entry whose
  turn comes while the control is disabled.
- **`handleSelect`** (the select context, which end adornments call) ignores the change: no
  pick, update or removal.
- **The context** (`useCrudSelectContext()`) and `useCrudSelect`'s result have a new
  `disabled` flag, so an end adornment can lock its own buttons.
- `useCrudSelect` takes `disabled` as a param. `CrudMultiSelect` and
  `CrudMultiSelectWithGroups` pass their `disabled` prop.

Both used to write: a plain `CrudMultiSelect` wrote to the backend at once, and
`FormCrudMultiSelect` queued the write and made the read-only Form dirty.

`initialSelected` is still listed by a disabled control.

## Why

The search field was disabled, but the ref and an end adornment still changed the
selection. In a read-only Form that queued a write the Form could not save, and every
attempt to leave it asked to discard changes. An end adornment could not tell that the
control was disabled, so it had to work it out from the Form itself.

## Migration

- Code that calls `addToSelection` on a control that may be disabled should handle the
  rejection.
- An end adornment that locks its button itself (`disabled={readOnly}` from the Form) can
  read `useCrudSelectContext().disabled` instead. The context's flag also covers the
  control's own `disabled`.
