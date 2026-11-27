# FormAutoSave announces the outcome of its saves in a status region

- **Date:** 2026-11-27
- **Kind:** behavior, theme
- **Scope:** `backend-components/Form` (`FormAutoSave`)

## What changed

`FormAutoSave` renders a polite status region (`role="status"`, a `span`) where it rendered
nothing. Its text is the outcome of the saves it starts: "Saving…" while one runs, "Saved"
once it went through, "Could not save" when it failed, translated in every locale (keys
`backend-components.form.auto-save.saving`, `.saved` and `.failed`). "Saved" is emptied when
the form has changes again, "Could not save" once the form has none. Screen readers announce
each outcome.

The region is visually hidden and takes no room in the layout: a 1px box in the top left
corner of the nearest positioned ancestor. With the new prop `showStatus` it is shown as a
caption line where `FormAutoSave` is placed, one line high also while it is empty.

`FormAutoSave` takes `className` and `classes` (slot `root`), and the theme name
`CcFormAutoSave` (`defaultProps`, `styleOverrides`). The root has the state classes
`CcFormAutoSave-visible` (with `showStatus`) and `CcFormAutoSave-saving`, `-saved` or
`-failed` while it has a text.

## Why

An auto-save told nobody whether it saved, was saving or failed: the only change in the page
was the form's `data-form-dirty` attribute. A screen-reader user could not tell whether a
change was kept, and a failed save of a nested form, which shows no error of its own, went
unnoticed (WCAG 4.1.3 Status Messages).

## Migration

Nothing is required. Screens with `FormAutoSave` look the same; screen readers now announce
its saves.

- `FormAutoSave` is an element now: it must sit where a `span` can go, not directly in a
  `table`, a table row or a list.
- A test that looks up a form page's one status region with `getByRole("status")` finds a
  second one where the page has `FormAutoSave` (a `BasicFormPage` has the status of its
  busy overlay); look it up by its text.
- To show the status to sighted users as well, place `FormAutoSave` where the line belongs
  and pass `showStatus`, or set it for every form with
  `components.CcFormAutoSave.defaultProps.showStatus` in the theme:

  ```tsx
  <FormField name={"signature"} />
  <FormAutoSave debounceTime={0} showStatus />
  ```
