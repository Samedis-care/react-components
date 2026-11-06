# DataGrid's enum filter labels its checkboxes with their text

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (the column filter of `type: "enum"` columns), and the
  grids built on it (`BackendDataGrid`, `CRUD`)

## What changed

- Every checkbox of an enum column's filter ("Select all", "Show all except…" and each
  value) is a MUI `FormControlLabel`: its text is the checkbox's `<label>`. A click on the
  text, or anywhere else in its row, ticks the checkbox, and screen readers read the text
  as the checkbox's name.
- A disabled value's text is greyed like its checkbox (MUI's disabled label colour).
- "Select all" shows the mixed state (MUI's indeterminate icon; screen readers announce
  it as partially checked) while some but not all values are ticked. A click on it then
  ticks all of them.
- The checkboxes form a group named "Values", translated in every locale (new key
  `standalone.data-grid.content.set-filter.label`).
- Each entry's text is the `FormControlLabel`'s label (`.MuiFormControlLabel-label`, a
  Typography with `noWrap`) instead of a `ListItemText`. The `setFilterListItem` slot
  stretches the label over the row without margins, so the checkboxes stay where they
  were and a long value still ends in an ellipsis.

## Why

Every checkbox was announced as "checkbox, not checked" without a name, so a screen
reader user could not tell which value it stands for. Only the checkbox itself toggled,
so a click on a value's text did nothing, and voice control users could not say
"click Open". "Select all" read "not checked" for a partial selection.

## Migration

Nothing to do for the apps. Theme overrides or CSS that style the entries' text through
`.MuiListItemText-root` or `.MuiListItemText-primary` inside the `CcDataGrid`
`setFilterListItem` slot have to select `.MuiFormControlLabel-label` instead. Tests that
find an entry's checkbox can use its name (`getByRole("checkbox", { name: "Open" })`).
Expect the mixed "Select all" and the greyed disabled values in screenshots.
