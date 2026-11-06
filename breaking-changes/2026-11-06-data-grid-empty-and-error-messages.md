# The DataGrid's empty and error messages are no longer headings, and are announced

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/DataGrid`

## What changed

The messages the DataGrid shows in place of rows are `<div>`s, not headings:

- "The list does not contain any data." and "No data matched your filters." were an
  `<h4>`. They are a `role="status"` region now, and the "Clear filters" button sits
  outside it.
- A load error was an `<h5>`. It is `role="alert"` now.

They keep their `MuiTypography-h4` and `MuiTypography-h5` classes and their look.

## Why

Screen readers listed the empty result as a level-4 heading that included the "Clear
filters" button, and a load error as a level-5 heading. Neither was announced when it
appeared.

## Migration

- A theme that styles these messages through their classes (`& .MuiTypography-h4`,
  `& .MuiTypography-h5` under `CcDataGrid.styleOverrides.centeredStickyTypography`):
  nothing to do. A selector by element (`& h4`, `& h5`) no longer matches; select the
  class instead.
- `CenteredTypography` itself is unchanged: like Typography, its `variant` picks the
  element unless `component` says otherwise. Required for an app that shows an error
  message with it, such as an auth error page with `variant="h1" color="error"`: pass
  `component` and `role="alert"`, otherwise the message is a heading and screen readers do
  not announce the failure.

  ```tsx
  <CenteredTypography
  	variant={"h1"}
  	color={"error"}
  	component={"div"}
  	role={"alert"}
  >
  	{error.message}
  </CenteredTypography>
  ```
