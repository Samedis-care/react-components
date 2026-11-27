# A running export entry is unavailable, and a ready or failed export is announced

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (the header's export menu, `IDataGridExporter`)

## What changed

- While its request runs, an export menu entry is `aria-disabled="true"`. It keeps keyboard
  focus and looks as before. Its progress indicator is hidden from assistive technology
  (`aria-hidden`), so screen readers read the entry as its `getWorkingLabel`, unavailable.
- When the request resolves, a polite status (`role="status"`) announces the exporter's
  `getReadyLabel`; when it fails, its `getErrorLabel`. Each entry has two visually hidden
  status regions, always rendered: one inside the entry, announced while the menu is open,
  and one beside the menu in the header, announced while the menu is closed. They hold the
  label while the entry shows it, and are empty otherwise. With `autoDownload` the entry
  does not turn ready (`onDownload` is called right away), so nothing is announced then.
- The entry is named by its label alone (`aria-labelledby`), not by the status in it.

## Why

A running export read as an operable "Exporting…, menu item" on which Enter did nothing,
and its progress indicator was a progressbar without a name. Ready and failed only changed
the entry's text: screen readers announced nothing unless the entry had focus, and nothing
at all once the menu was closed.

## Migration

Nothing is required. While an entry shows its ready or error label, a test that looks the
label up with `getByText` finds it three times (the entry and its two status regions): look
up the entry by role and name instead, `getByRole("menuitem", { name })`. A test that calls
`getAllByRole("status")` finds the export menu's regions too.
