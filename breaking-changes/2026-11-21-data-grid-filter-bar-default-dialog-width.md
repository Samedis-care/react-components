# A DataGrid filter bar narrower than 600px opens as a panel by default

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (`enableFilterDialogWidth`), and through it
  `BackendDataGrid` and the CRUD grids

## What changed

- `enableFilterDialogWidth` defaults to `600` when a grid has a `filterBar` and sets neither
  `enableFilterDialogWidth` nor the deprecated `enableFilterDialogMediaQuery`. While the
  header leaves less than 600px for the filter bar, it shows the button that opens the
  `filterBar` in the panel over the rows (`inDialog` is `true`) instead of the bar. That is
  every phone, and on a desktop every grid narrower than about 1060px with the default
  header buttons. More header buttons (export, import, add) raise that grid width.
- `enableFilterDialogWidth={0}` keeps the bar in the header at any width.
- A grid that sets `enableFilterDialogMediaQuery` and no `enableFilterDialogWidth` works as
  before: the media query alone decides.

## Why

The filter helpers (`GridSingleSelectFilter`, `GridMultiSelectFilter` and their Backend
variants) take a third of the bar each by default. Without a dialog width, a 320px phone left
165px for the bar, so each select was 44px wide: "Open" showed as "O…" and the label
"Status" as "S…". The page did not scroll sideways, so nothing showed that the filters
could not be read. At 600px each helper is about 190px wide, and on a phone the panel shows
each filter at full width.

## Migration

Nothing to do for SCF and IMF. Every SCF grid with a filter bar sets
`enableFilterDialogWidth`, through `SamedisCrud`'s `useDefaultGridProps` or itself
(`TrainingMatrixGrid`). IMF sets `enableFilterDialogMediaQuery` in its
`useDefaultGridProps` and has no filter bars.

Required for an app with a `filterBar` that sets neither prop and needs the bar in the
header below 600px (for example a single filter that `barBreakpoints` makes full width):
pass the width its filters need, or `0` to keep the bar at any width. Without it, the
header shows the panel's button instead of the bar.

```tsx
<DataGrid
	filterBar={StatusFilterBar}
	// the one filter is full width (barBreakpoints={{ xs: 12 }}) and fits in 250px
	enableFilterDialogWidth={250}
	{...gridProps}
/>
```

Required for unit tests (jsdom) that use a grid's filter bar in the header, for example a
filter bar that probes the grid state: jsdom lays nothing out, so the bar measures 0px and
renders as the panel's button. Pass `enableFilterDialogWidth={0}` in such tests.
