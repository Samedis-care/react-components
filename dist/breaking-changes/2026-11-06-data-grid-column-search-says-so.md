# The column settings' search says that it searches the columns, and when nothing matches

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (header search, column settings)

## What changed

While the column settings ("Columns") are open, the header's search box filters the list of
columns instead of the rows. During that time:

- Its placeholder is "Search columns" (`standalone.data-grid.settings.search`) instead of the
  grid's `searchPlaceholder`, and the field is named "Search columns" (`aria-label`). Below
  `sm`, the button that opens the field is named "Search columns" too.
- A query that matches no column shows the row "No matching column"
  (`standalone.data-grid.settings.no-match`) in the settings table, and a polite status
  (`role="status"`) announces it.

The status is a visually hidden element in the settings panel: the new `CcDataGrid` theme
slot and class key `settingsStatus`.

## Why

The box kept the grid's placeholder while it searched the columns, so nothing said what it
searched, and a query without a match left an empty table with no text, which reads as "this
column does not exist".

## Migration

Nothing is required. Expect the new placeholder and the "No matching column" row in
screenshots of the open column settings. A test that finds the search box by the grid's
placeholder while the settings are open, or that counts the rows of the settings table,
needs updating.
