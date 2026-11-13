# The locale selector's search box is named "Search", and a status announces its result

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `non-standalone/LocaleSelector` (LocaleSelectorDialog)

## What changed

- The search box shows the placeholder "Search" and is named "Search" (`aria-label`), both
  from `standalone.data-grid.header.search`.
- A polite status (`role="status"`) states the number of rows the search leaves, "Results: 3"
  (the new key `non-standalone.language-switcher.results`), or, when none match, "No locales
  match your search query". It is a visually hidden element below the search box, always
  rendered, so screen readers announce each change of its text: the new
  `CcLocaleSelectorDialogContent` theme slot `searchStatus`.

## Why

The box had no name and no visible label, only a magnifier icon: screen readers read an
unnamed "edit text". Typing filtered the list, or replaced it with the no-match message,
without anything being announced.

## Migration

Nothing is required. Expect the placeholder in screenshots of the dialog. A test that
calls `getByRole("status")` in the open dialog now finds this status.
