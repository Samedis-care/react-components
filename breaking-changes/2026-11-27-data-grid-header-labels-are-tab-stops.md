# DataGrid column header labels are tab stops: a sortable column's label is its sort button

- **Date:** 2026-11-27
- **Kind:** behavior, theme
- **Scope:** `standalone/DataGrid` (column headers), and through it `BackendDataGrid` and the
  CRUD grids

## What changed

- The label of a sortable column is a `<button>` named with the label's text (theme slot and
  `classes` key `columnHeaderSortButton`). Tab reaches it. Enter or Space sorts the column as
  a click on the header does, Shift+Enter adds or removes it as a further sort as Shift+click
  does. Keyboard focus draws a focus ring and opens the label's tooltip, which shows the full
  text of a label cut off with an ellipsis. Clicks on the header sort as before.
- The label of a column that does not sort is a tab stop when it is a string (theme slot and
  `classes` key `columnHeaderLabelText`), so its tooltip opens on keyboard focus too. A
  `headerLabel` element is rendered as it is, without a tab stop of its own.
- The header therefore has one more tab stop per column: Name, Name's Filter, Age, Age's
  Filter, …
- The label's slot `columnHeaderLabel` no longer cuts off its content: `overflow: hidden` and
  `textOverflow: ellipsis` moved to `columnHeaderSortButton` and `columnHeaderLabelText`, and
  the label got `minWidth: 0`.

## Why

Sorting was possible with the mouse only, and a header cut off with an ellipsis could only be
read in full by hovering it (WCAG 2.1.1 Keyboard, 1.4.13 Content on Hover or Focus).

## Migration

Nothing to do for most apps; expect the focus ring and the tooltip in screenshots taken while
a header has keyboard focus.

Required for any app that passes a `headerLabel` holding a link, button or other control to a
sortable column: the label is now the content of a `<button>`. A control inside a button is
invalid HTML, and screen readers read it as part of the button's name, not as a control of its
own. Move the control out of the label, or leave out the column's `sortable`.

Required for any app whose theme changes how a long header label is cut off (`overflow`,
`textOverflow` in `styleOverrides.columnHeaderLabel`): set them on `columnHeaderSortButton` and
`columnHeaderLabelText` instead, or the override no longer applies.

```ts
// before
CcDataGrid: { styleOverrides: { columnHeaderLabel: { textOverflow: "clip" } } }
// after
CcDataGrid: {
	styleOverrides: {
		columnHeaderSortButton: { textOverflow: "clip" },
		columnHeaderLabelText: { textOverflow: "clip" },
	},
}
```

Required for any app whose tests or automation step through a grid's header with Tab, or find
a button by a name that is also a sortable column's label: expect the label's stop before the
column's Filter button, and a second button of that name in the header.
