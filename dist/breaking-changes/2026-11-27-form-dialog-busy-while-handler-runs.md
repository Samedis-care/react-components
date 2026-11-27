# While a FormDialog button's handler runs, the dialog ignores its buttons, Escape and the backdrop

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog` `FormDialog`

## What changed

While the promise a button's `onClick` returned is pending, FormDialog behaves like
ErrorDialog (and so InfoDialog and ConfirmDialog):

- clicks on its buttons are ignored, so a second click or Enter runs no handler: each
  activation runs the handler once;
- Escape and a backdrop click are ignored, so the dialog stays and `onClose` is not called
  before the handler has ended;
- the dialog (the element with `role="dialog"`) is `aria-busy="true"`, its buttons are
  `aria-disabled="true"` with MUI's disabled look (the `Mui-disabled` class) but stay
  focusable, and the pressed button shows a 16px progress spinner before its label (hidden
  from assistive technology).

This shows only while the dialog is still open: for a `dontClose` button, and for a
FormDialog rendered without pushDialog. A pushed FormDialog whose button has no
`dontClose` closes before the handler runs, as before. A handler that does not return a
promise changes nothing visible.

## Why

A double click on a `dontClose` button such as Save ran the save twice, and Escape while
it ran removed the dialog and called `onClose` before the save had finished. Nothing showed
that the dialog was working.

## Migration

Nothing to do. A `dontClose` handler that was meant to run again while its first run is
still pending, or code that closed the dialog with Escape during the handler, no longer
does. Tests that click a FormDialog button twice in a row while its handler runs see one
call. Screenshots of a busy FormDialog show the spinner in the pressed button.
