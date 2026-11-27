# A form page's Back reports and shows an error thrown by the Form's goBack

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `backend-components/Form/BasicFormPage`, and the pages built on it
  (`DefaultFormPage`, `FlowEngineFormPage`, every CRUD record page)

## What changed

The footer's `customProps.goBack` (the form page's Back, and `DefaultFormPage`'s
`autoBack` after a save) used to treat every error as the user's "No" on "Leave form
page?": when the Form's `goBack` threw (a CRUD's
`goBackCallback` that throws, a `popDialog` with no dialog open), Back did nothing, and
nothing was reported or shown.

Now only the user's "No" (or Escape, or a click on the backdrop) cancels. An error thrown by
the Form's `goBack`:

- is reported through `captureError` with the source `BasicFormPage.goBack`, so the
  configured `report` receives it when `shouldReport` lets it through,
- is shown in an error dialog titled "An error occurred" with the error's message and an OK
  button.

The promise the footer's `goBack` returns still never rejects for such an error; it now
resolves once the error dialog is closed.

## Why

Back did nothing without a word, and the app's bug behind it reached no error tracker.

## Migration

Nothing to do. Expect reports with the source `BasicFormPage.goBack` from now on, and an
error dialog where Back used to do nothing; a footer that awaits `goBack` continues once
the user has closed that dialog.
