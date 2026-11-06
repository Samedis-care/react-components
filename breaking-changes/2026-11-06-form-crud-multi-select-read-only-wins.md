# FormCrudMultiSelect stays locked in a read-only Form, whatever `disabled` says

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `backend-components/Form/CrudControls`

## What changed

`FormCrudMultiSelect` is locked (search field disabled, no remove buttons) while its Form
is read-only, which includes a save in progress. This now also holds when the caller passes
`disabled={false}` or `disabled={undefined}`. Those used to unlock it, because the caller's
`disabled` replaced the one the control derives from the Form. `disabled={true}` still locks
it in an editable Form.

## Why

An edit in a read-only Form queued a write that the Form could not save, and made the Form
dirty, so every attempt to leave it asked to discard changes. During a save, an edit could
be made while the queue was being sent.

## Migration

Nothing required. A wrapper that passes its own `disabled` through (`disabled={disabled}`)
is locked in a read-only Form now, also when its own `disabled` is `false` or `undefined`.
It no longer needs to combine its `disabled` with the Form's `readOnly` itself.
