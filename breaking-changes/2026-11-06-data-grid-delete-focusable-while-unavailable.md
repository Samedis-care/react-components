# The DataGrid's Delete stays focusable while unavailable

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` footer, and the grids built on it (`BackendDataGrid`,
  `CRUD`)

## What changed

While Delete is unavailable (nothing selected, everything selected without
`enableDeleteAll`, or shown through `disableDeleteHint` without `onDelete`), the footer's
Delete button is no longer natively `disabled`. It is marked `aria-disabled="true"`, keeps
MUI's `Mui-disabled` class (it looks as before), ignores clicks, Enter and Space, and stays
in the tab order. Edit and the custom actions are unchanged.

## Why

A delete clears the selection, which makes Delete unavailable while it has keyboard
focus. A natively disabled button loses focus, so after a delete by keyboard (also after
"Yes" in BackendDataGrid's confirmation, or OK in its error dialog) focus fell to the
page, and the next Tab started over from the top. Now focus stays on Delete, and a screen
reader announces it as unavailable.

## Migration

Nothing to do for SCF and IMF.

- A test that checks the unavailable Delete with `toBeDisabled()` / `toBeEnabled()` (or
  `:disabled`) has to check `aria-disabled` instead, e.g.
  `expect(deleteButton).toHaveAttribute("aria-disabled", "true")` and
  `expect(deleteButton).not.toHaveAttribute("aria-disabled")`. `toBeEnabled()` passes for
  an unavailable Delete now.
- Styles for the unavailable Delete keep working through `.Mui-disabled`, not through
  `:disabled`.
- Expect one more Tab stop in the footer while Delete is unavailable.
