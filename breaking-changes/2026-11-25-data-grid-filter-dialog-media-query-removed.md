# The DataGrid no longer takes `enableFilterDialogMediaQuery`

- **Date:** 2026-11-25
- **Kind:** type, behavior
- **Scope:** `standalone/DataGrid` (`IDataGridHeaderProps`, `DataGridProps`), and through it
  `BackendDataGrid` and the CRUD grids

## What changed

- `enableFilterDialogMediaQuery`, deprecated in favor of `enableFilterDialogWidth`, is no
  longer a prop of `IDataGridHeaderProps`, and so of `DataGridProps`, `BackendDataGridProps`
  and the props a CRUD passes to its grid. TypeScript rejects it, also as a key of
  `Pick<DataGridProps, …>` or `Omit<DataGridProps, …>`.
- The width the header leaves for the filter bar alone decides whether the header shows the
  bar or the button that opens it in the panel over the rows: `enableFilterDialogWidth`, `600`
  by default for a grid with a `filterBar`. A grid that passed the media query without
  `enableFilterDialogWidth` now gets that default; a media query that an untyped caller still
  passes is ignored.

## Why

The media query looked at the window, not at the space the header has for the bar, so a
grid narrower than the window (in a dialog, next to a side panel, with more header buttons)
kept a bar whose filters did not fit. `enableFilterDialogWidth` measures the bar's own
container and has a default for every grid with a filter bar
([2026-11-21](2026-11-21-data-grid-filter-bar-default-dialog-width.md)).

## Migration

Required for any app that passes `enableFilterDialogMediaQuery`, directly or from shared
default grid props, or names it in a type: remove it. Without this the TypeScript build fails
(`Pick<DataGridProps, "enableFilterDialogMediaQuery">` too).

- A grid with a `filterBar`: pass the width in px its filters need in the header as
  `enableFilterDialogWidth`, or leave it out for the 600px default. The width is the bar's
  own: the grid's width minus the search field and the header buttons, not the window's.
- A grid without a `filterBar`: the media query had no effect; remove it and nothing else
  changes.

```tsx
// before
<DataGrid
	filterBar={StatusFilterBar}
	enableFilterDialogMediaQuery={theme.breakpoints.down("lg")}
	{...gridProps}
/>
// after: the bar shows while the header leaves it 400px, below that the button
<DataGrid filterBar={StatusFilterBar} enableFilterDialogWidth={400} {...gridProps} />

// before
const useGridDefaults = (): Pick<
	DataGridProps,
	"enableFilterDialogMediaQuery" | "filterLimit"
> => …;
// after
const useGridDefaults = (): Pick<
	DataGridProps,
	"enableFilterDialogWidth" | "filterLimit"
> => …;
```
