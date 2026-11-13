# FormCrudMultiSelect is read-only, not disabled, in a read-only form, and stays as it is while the form saves

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `backend-components/Form/CrudControls/FormCrudMultiSelect`; new prop `readOnly`
  on `MultiSelect`, `BackendMultiSelect` and `CrudMultiSelect`, new param `blockWrites` on
  `useCrudSelect` and the Crud selects; theme slots `CcMultiSelect.label` and
  `CcMultiSelect.empty`

## What changed

`FormCrudMultiSelect` used to disable its search field whenever the form was read-only, and a
form is read-only during every save too.

- In a form that is read-only for any reason other than a save (`readOnly`,
  `readOnlyReasons`, a missing edit permission in CRUD), the control is now **read-only**: it
  shows its label and the entries in a closed box, without search field, end adornments or
  remove buttons, and "No entries" when there are none. Label and entries keep their normal
  colors. An entry with `onClick` stays a button. Nothing is written, as before. While the
  entries load, the field looks as it does in an editable form.
- While the form saves, the control is left as it is: the search field stays enabled, keeps its
  focus and the text typed into it, and the entries keep their remove buttons. Picks and
  removals are ignored while it runs (the ref's `addToSelection` rejects, and
  `handleSelect` ignores the change), as before.
- `useCrudSelectContext().disabled` is still `true` in both cases.

`MultiSelect` takes a new `readOnly` prop for this, and with it `BackendMultiSelect` and
`CrudMultiSelect` (which writes nothing while it is set). It takes precedence over `disabled`.
`useCrudSelect` (and so `CrudMultiSelect` and `CrudMultiSelectWithGroups`) takes
`blockWrites`, which writes nothing like `disabled` but leaves the control as it is.

## Why

A disabled field is skipped by the keyboard, announced as unavailable and drawn greyed out,
which is wrong for data the user may read but not change. A read-only field that keeps its
search field still looks editable, so the read-only selector shows only what is selected, as
the read-only file upload shows only its files. Disabling the field during a save threw the
focus out of it and cleared the text being typed, after every save, including those
`FormAutoSave` starts.

## Migration

Nothing required. `FormCrudMultiSelect`'s `disabled` still disables it in an editable form; in
a read-only form the read-only look wins. An end adornment is not shown in a read-only form.
Tests that expect the search field to be disabled in a read-only form now find no search field
there, and an enabled one during a save.
