# DataGrid applies `classes.settingsTable`

- **Date:** 2026-11-27
- **Kind:** behavior, theme
- **Scope:** `standalone/DataGrid` (the column settings table), and
  `backend-components/DataGrid`, which passes its `classes` on

## What changed

`classes.settingsTable` is added to the `<table>` of the column settings, from the
`classes` prop and from `components.CcDataGrid.defaultProps.classes`. Before, the key was
accepted and typed, but its class name was dropped. The theme slot
(`components.CcDataGrid.styleOverrides.settingsTable`) applied before and still does.

## Why

`settingsTable` is a key of `DataGridClassKey`, and the other parts of the column settings
(`settingsTableHead`, `settingsTableBody`, `settingsTableRow`, `settingsTableCell`,
`settingsStatus`) already got their class names from `classes`. Only the table got none,
so an app could not style the settings table of one grid without a theme override.

## Migration

Nothing required. A grid that passes `classes.settingsTable`, or a theme that sets
`components.CcDataGrid.defaultProps.classes.settingsTable`, gets those styles now: check
that the column settings look as intended.
