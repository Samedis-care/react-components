# DataGrid select all selects everything or nothing

- **Date:** 2026-09-29
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (the footer's select all checkbox, `enableSelectAll`), and
  `BackendDataGrid` and CRUD built on it

## What changed

- A click on select all selects every row, or clears the selection when everything is
  selected. The rows ticked or unticked one by one before are dropped. They used to carry
  over and become the exceptions, so the click inverted the selection: with two rows ticked,
  select all selected everything except those two.
- The checkbox is checked only while everything is selected. While part of the rows is
  selected (some rows ticked, or everything except some), it shows a dash (indeterminate),
  and a click selects everything.

## Why

That is how a select all checkbox works elsewhere: all, then nothing. Inverting the
selection surprised users.

## Migration

Nothing to do. A controlled `selection` gets the new value through `onSelectionChange`: after
a click on select all it is `[true, []]` or `[false, []]`.
