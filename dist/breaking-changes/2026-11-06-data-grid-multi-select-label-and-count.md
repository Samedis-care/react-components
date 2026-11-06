# BackendDataGridMultiSelect shows its label and the number of selected rows

- **Date:** 2026-11-06
- **Kind:** behavior, type
- **Scope:** `backend-components/Selector` (`BackendDataGridMultiSelect`),
  `backend-integration` (`ModelDataTypeBackendDataGridMultiSelectRenderer`)

## What changed

- `BackendDataGridMultiSelect` renders a fieldset around the grid. It has a new prop
  `label`: shown above the grid as the fieldset's legend, it names the field (a group)
  for assistive technology.
- Between the label and the grid it shows how many rows are selected ("Selected: 2", new
  key `backend-components.selector.selected-count` in all locales). The text is a polite
  live region, so a tick is announced, and it describes the field. It is shown with or
  without a label.
- The grid fills the height the field has left below them.
- The model renderer passes the field's label, so a form field shows it with the required
  asterisk and error colour of the field. Its outer element is no longer a fieldset (the
  component's own fieldset is); it carries the field name as `data-name`.
- New theme name `CcBackendDataGridMultiSelect` for `styleOverrides`, slots `root`, `label`,
  `status` and `grid`.

## Why

As a form field the grid had no name: the field's label was never rendered, visually or for
assistive technology, and nothing said how many rows were selected once the selected rows
had scrolled out of view.

## Migration

Nothing required. Expect the label and the "Selected: n" line above the grid in screenshots;
the grid gets about 45px less of the field's height. An app that renders
`BackendDataGridMultiSelect` directly with a heading of its own above it should pass that
text as `label` instead, so the field is named.
