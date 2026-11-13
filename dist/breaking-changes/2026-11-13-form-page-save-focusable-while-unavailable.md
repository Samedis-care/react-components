# A form page's Save stays focusable while unavailable

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `backend-components/Form` (`FormPageSaveButton`, so DefaultFormPage's footer,
  EditOnlyFormPage's footer and FlowEngineSaveButton)

## What changed

While Save is unavailable (the form is not dirty, saves or is read-only, or the caller
passes `disabled`), it is no longer natively `disabled`. It is marked
`aria-disabled="true"`, keeps MUI's `Mui-disabled` class (it looks as before), ignores
clicks, Enter and Space (its `onClick` is not called), and stays in the tab order. While
it has keyboard focus, the tooltip with the reasons the form is read-only shows, as it does
for the pointer.

## Why

A save disables Save while it has keyboard focus, and a natively disabled button loses
that focus: after Save was pressed by keyboard, focus fell to the page (in a form dialog,
to the dialog) and stayed there after the save, so the next Tab started over. Now focus
stays on Save during and after the save, and a screen reader announces it as unavailable.
Keyboard users also reach a read-only form's Save and its reason, which only the pointer
could show before.

## Migration

Nothing to do for SCF and IMF.

- A test that checks the unavailable Save with `toBeDisabled()` / `toBeEnabled()` (or
  `:disabled`) has to check `aria-disabled` instead, e.g.
  `expect(save).toHaveAttribute("aria-disabled", "true")` and
  `expect(save).not.toHaveAttribute("aria-disabled")`. `toBeEnabled()` passes for an
  unavailable Save now, so a test that waits for it to make sure the form is dirty has to
  wait for the missing `aria-disabled`. Playwright's `toBeDisabled()` / `toBeEnabled()`
  read `aria-disabled` and keep working.
- Styles for the unavailable Save keep working through `.Mui-disabled`, not through
  `:disabled`.
- Expect one more Tab stop in the footer while Save is unavailable.
