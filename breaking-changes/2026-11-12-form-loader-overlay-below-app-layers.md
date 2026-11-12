# The busy overlay stays below dialogs, snackbars, tooltips and the app bar

- **Date:** 2026-11-12
- **Kind:** behavior, theme
- **Scope:** `standalone/Form/FormLoaderOverlay`, and so the busy overlay of every form page
  (BasicFormPage, DefaultFormPage, EditOnlyFormPage, FlowEngineFormPage) and of the language
  dialog

## What changed

The wash of `FormLoaderOverlay` has a z-index of `theme.zIndex.mobileStepper - 1` (999 with
MUI's defaults) instead of 9999. That is below every app-level layer of the theme (mobile
stepper 1000, fab and speed dial 1050, app bar 1100, drawer 1200, modal 1300, snackbar 1400,
tooltip 1500):

- A dialog, menu, popover, snackbar or tooltip shown while the overlay is up is drawn above
  the wash and can be clicked. Before, wherever the overlay was not inside a stacking context
  of its own (form pages in a page shell, an overlay in a page), these were washed out and
  every click on them hit the overlay, so a dialog opened from a form's pre- or post-submit
  handler or from `onSubmit` could not be used until the save had finished.
- A fixed or sticky app bar, a drawer, a fab or a mobile stepper that overlaps the busy area
  stays above the wash.
- Content of the covered area that has a z-index of its own below 999 (outlined field labels,
  badges, sticky headers, a raised button bar) is still covered, before or after the overlay in
  the DOM. Content with a z-index of 999 or more can now show above the wash, unless it is inside a
  stacking context of its own. FormPageLayout's body is one, so on form pages that use the
  library layout the whole form stays covered.

Inside a dialog (FormDialog, the language dialog) the overlay is drawn within the dialog's own
stacking context, so a dialog opened on top of it could already be used there. What is said
above about content with a z-index of 999 or more applies inside a dialog too.

## Why

The overlay belongs to the form it covers. With 9999 it was drawn over the app's own layers,
which MUI keeps above page content, and a dialog the app opened during a save was visible but
dead.

## Migration

- **Optional, for forms that use `onSubmitUserInteractive` only to show a dialog from
  `onSubmit`:** the dialog can be used without it now. Keep it where the form itself has to be
  editable again while `onSubmit` runs.
- **Required for a layout of your own that shows the overlay over content with a z-index of
  999 or more** (such as `zIndex: 1000` to keep an element clickable): that content is no
  longer covered while the form is busy. Lower its z-index below 999, or give the element
  that holds the covered content `isolation: isolate`, as FormPageLayout's body has:

  ```tsx
  const Body = styled("div")({ isolation: "isolate" });
  ```

- A theme that needs a different value sets
  `components.CcFormLoaderOverlay.styleOverrides.root.zIndex`.
