# The locale selector opens at the row of the current locale

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `non-standalone/LocaleSelector` (`LocaleSelectorDialog`'s list)

## What changed

- The dialog opens with its list scrolled to the row of the current locale (the row
  marked with the check), in the middle of the list, as MUI's Select opens its menu at
  the selected option. When that row is in view at the top of the list already, the
  list stays as it is. A current locale without a row scrolls nothing.
- The order of the rows is unchanged: the rows of the browser's languages come first,
  then the rest by number of speakers. When the list opens further down, those rows
  are above its visible part.
- Keyboard focus does not move: it stays on the dialog, the list only scrolls.
- Every change of the search query (typing, deleting, clearing it) shows the matches
  from the top of the list, wherever the list was scrolled before.

## Why

The current row could be far out of sight: with the UI in `de-AT`, the browser in
English and `supportedLocales={["fr", "ru", "de", "en", "nl"]}`, Österreich is row 31,
and the dialog opened on the United States, India, Russia. A search kept the list's
scroll position, so its first matches could be scrolled out of view.

## Migration

Nothing to do, but expect the list scrolled to the current row in screenshots of the
locale dialog. A test that looks for the first rows right after opening the dialog
scrolls the list to the top first (`list.scrollTop = 0`), or opens it with the UI in a
locale whose row is near the top.
