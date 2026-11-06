# The Save buttons of DefaultFormPage and FlowEngine say why the form is read-only

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `backend-components/Form` (DefaultFormPage's footer, FlowEngineSaveButton)

## What changed

- DefaultFormPage's Save and FlowEngineSaveButton are the same component now,
  `FormPageSaveButton` (exported). While the form is read-only for reasons with a text
  (`readOnlyReasons`, a CRUD's `editPermissionHint`, "The form is currently being saved"
  during a save), the texts, joined with ", ", show in a tooltip when the pointer is on
  Save, and they are Save's accessible description (`aria-describedby`).
- FlowEngineSaveButton shows that tooltip too. It used to say nothing.
- The `span` around DefaultFormPage's read-only Save no longer has an `aria-label` with
  the reasons; the button's description replaces it.
- Both Save buttons sit in a `span` at all times, not only while read-only, so the button
  is not mounted again when a save makes the form read-only. It looks the same.

## Why

A read-only form's Save gave screen readers no reason: the `aria-label` on a `span` is not
announced, and FlowEngineSaveButton gave no reason to anyone.

## Migration

Nothing required. A test or style that expects the Save button as the direct child of the
footer's button wrapper (`CcFormButtons` `buttonWrapper`) has to allow the `span` in
between, and a test that read the reason from the `span`'s `aria-label` checks Save's
accessible description instead (`toHaveAccessibleDescription`).
