# FormCrudMultiSelect is read-only, not disabled, in a read-only form, and stays as it is while the form saves

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `backend-components/Form/CrudControls/FormCrudMultiSelect`; new props
  `readOnly` on the selectors (`BaseSelector`, `SingleSelect`, `MultiSelect`, the backend
  selectors and `CrudMultiSelect`) and `blockWrites` on `useCrudSelect` and the Crud selects

## What changed

`FormCrudMultiSelect` used to disable its search field whenever the form was read-only, and a
form is read-only during every save too.

- In a form that is read-only for any reason other than a save (`readOnly`,
  `readOnlyReasons`, a missing edit permission in CRUD), the control is now **read-only**: the
  search field stays in the tab order and has the `readonly` attribute, takes no typing and
  opens no list, its label keeps its normal color, and the entries have no remove buttons.
  Nothing is written, as before.
- While the form saves, the control is left as it is: the search field stays enabled, keeps its
  focus and the text typed into it, and the entries keep their remove buttons. Picks and
  removals are ignored while it runs (the ref's `addToSelection` rejects, and
  `handleSelect` ignores the change), as before.
- `useCrudSelectContext().disabled` is still `true` in both cases, so end adornments that lock
  themselves on it behave as before.

The selectors take a new `readOnly` prop for this, MUI's Autocomplete `readOnly`: the input is
focusable and marked read-only, opens no list and shows no clear button, `MultiSelect` hides
its remove buttons, and `CrudMultiSelect` writes nothing. `useCrudSelect` (and so
`CrudMultiSelect` and `CrudMultiSelectWithGroups`) takes `blockWrites`, which writes nothing
like `disabled` but leaves the control as it is. `MultiSelectWithoutGroup` and
`MultiSelectWithTags` do not take `readOnly`.

## Why

A disabled field is skipped by the keyboard, announced as unavailable and drawn greyed out,
which is wrong for data the user may read but not change. Disabling the field during a save
threw the focus out of it and cleared the text being typed, after every save, including
those `FormAutoSave` starts.

## Migration

Nothing to do. `FormCrudMultiSelect`'s `disabled` still disables it, also in a read-only
form. Tests that expect its search field to be disabled in a read-only form, or during a
save, now find it read-only, or enabled.
