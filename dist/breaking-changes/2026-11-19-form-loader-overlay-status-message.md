# The busy overlay is a status message, and a busy form is `aria-busy`

- **Date:** 2026-11-19
- **Kind:** behavior, theme
- **Scope:** `standalone/Form/FormLoaderOverlay`, `backend-components/Form/Form`, and so every
  form page (BasicFormPage, DefaultFormPage, EditOnlyFormPage, FlowEngineFormPage) and the
  language dialog

## What changed

- `FormLoaderOverlay` renders a status region (`role="status"`, visually hidden, theme slot
  `status`) right after its wash, whether the overlay is visible or not. While `visible`, its
  text is the new prop `message`, or "Loading…" in the library's current language without it.
  Screen readers announce it when `visible` turns true, at once, not only when the wash fades
  in after 1s. When `visible` turns false the region is emptied, which is not announced.
- The spinner in the wash is no status region of its own any more (`role="none"` on the Loader).
  Its progressbar is named by the message.
- With `children`, the wrapped content has `aria-busy="true"` while the overlay is visible.
- BasicFormPage passes "The form is currently being saved" (the translated
  `backend-components.form.read-only.submitting`, the form's read-only reason while it saves),
  so every form page announces that it saves, also while it is busy through `addBusyReason`.
- Form's root element (the `<form>`, or the `<div>` of a nested form and with
  `renderFormAsDiv`) has `aria-busy="true"` while the form submits or is busy (`submitting`).
  It has no `aria-busy` otherwise.

## Why

Nothing told a screen-reader user that a form was being saved (WCAG 4.1.3 Status Messages):
after Save, every field and button became unavailable and nothing said why. The spinner was
the only sign of it, and the overlay offered callers no way to word what it stands for.

## Migration

- **Required for an overlay that stands for something else than loading** (an import, a
  training or a task that runs, a file that is converted): pass what it does as `message`,
  translated. Without it screen readers hear "Loading…".

  ```tsx
  <FormLoaderOverlay visible={importing} message={t("import.importing")}>
  	<ImportStep />
  </FormLoaderOverlay>
  ```

- **Required for tests that expect a single status region** where an overlay is mounted (a form
  page, the language dialog, a page with an overlay of its own): `getByRole("status")` finds the
  overlay's too, also while it is hidden (then it is empty), and throws on two. Pick the one you
  mean by its text:

  ```ts
  const [status] = screen
  	.getAllByRole("status")
  	.filter((region) => region.textContent !== "");
  ```

- Tests and CSS that take the overlay to be the last child of the element it is placed in
  (FormPageLayout's `other`) find the status region there now. Give the overlay a `className`
  and select the wash by it instead.
- Tests that select `[aria-busy="true"]` in a form page while it saves also match the form now.
- A theme that styles every child of the overlay's container should leave the `status` slot
  visually hidden. A theme that wants the message on screen styles
  `components.CcFormLoaderOverlay.styleOverrides.status`.
