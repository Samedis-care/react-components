# Open dialogs no longer block navigation or closing the tab

- **Date:** 2026-11-13
- **Kind:** behavior, i18n
- **Scope:** `framework` (`DialogContextProvider`): every dialog shown with `pushDialog` or a `show…Dialog` helper; the translation key `framework.dialogs.navblock`

## What changed

- `DialogContextProvider` no longer blocks the history while a pushed dialog is open. Browser
  Back and Forward, links and `navigate()` go through, also from a dialog button's handler and
  from code that awaits a `show…Dialog` helper. Closing or reloading the tab no longer asks
  either. The alert "Navigation is blocked. Please close your open dialogs first." is gone,
  and so is its translation key `framework.dialogs.navblock` (the whole `framework` section of
  the translations).
- A dialog stays open when the location changes. It closes as before: through its buttons,
  Escape, the backdrop or code.
- A form page with unsaved changes still guards them, also inside a `FullFormDialog`: it asks
  "Leave form page?" before a navigation, and the browser asks before the tab is closed. This
  guard belongs to the form page and is unchanged.
- The provider no longer warns "Unmounting with N dialogs open".

## Why

The block applied to every open dialog, also when nothing would be lost: with an info dialog
open after a successful save, Back and closing the tab were refused. It also stopped
navigations the app itself started: a button handler that navigates runs while its dialog is
still open, so it got the alert and stayed on the page. The same happened to code after
`await showConfirmDialog(…)`, so "Leave form page?" → Yes, and a form page's Back → Yes, did
not leave a page with unsaved changes. Unsaved changes are guarded by the form page.

## Migration

- Nothing required.
- A handler that closes its dialog before it navigates (`close(); navigate(…)`, or
  `dontClose` with `popDialog()`) keeps working. The close is no longer needed for the
  navigation, so `{ text, onClick: () => navigate(target) }` is enough.
- A dialog that should not outlive the page it belongs to has to be closed by the app when
  the page goes away, e.g. by the code that navigates.
- An app that overrides `framework.dialogs.navblock` in its own translations can drop it.
