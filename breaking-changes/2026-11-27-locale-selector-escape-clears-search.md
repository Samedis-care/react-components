# Escape in the locale selector's search box clears the query before it closes the dialog

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `non-standalone/LocaleSelector` (LocaleSelectorDialog, showLocaleSelectorDialog)

## What changed

While the search box holds a query, Escape in it clears the query instead of closing the dialog,
as MUI's Autocomplete does with `clearOnEscape`. Focus stays in the search box, and the list
shows every row again from the top. The next Escape, with the box empty, closes the dialog as
before: `onClose` is called, and `showLocaleSelectorDialog` resolves to `null`.

Escape anywhere else in the dialog (a row, the list, the close button) still closes it at once,
also while the search box holds a query. An Escape that ends an IME composition leaves the query
alone.

## Why

Escape is the common way to clear a search box. It closed the whole dialog, so a user who
typed a query and pressed Escape to start over lost the dialog instead.

## Migration

Nothing to do in an app. A test that types into the search box and presses Escape there to
dismiss the dialog has to press Escape twice, or clear the box first.
