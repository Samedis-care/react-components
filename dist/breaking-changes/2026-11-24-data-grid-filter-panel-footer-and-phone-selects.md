# The DataGrid's filter panel has a row count, Reset and "Show results", and shows the bar's selects on a phone

- **Date:** 2026-11-24
- **Kind:** behavior
- **Scope:** `standalone/DataGrid`: the filter panel (`filterBar` below
  `enableFilterDialogWidth`), `GridSingleSelectFilter`, `GridMultiSelectFilter`,
  `GridMultiSelectFilterBackend`

## What changed

- **The panel's footer.** Next to its button the panel shows the grid's row count in the
  footer's words ("Filtered: 3 Total: 40"), in a status region that announces the count a
  pick leads to. While the grid reloads it keeps the last count. A new **"Reset"** button
  sets the custom data back to `defaultCustomData`; the search and the column filters stay,
  and an override (`overrideCustomData`) is not released, unlike the header's "Reset
  filter". `hideReset` hides it, as it hides the header's "Reset".
- **"Close" is "Show results".** The panel's button closes it as before; the picks still
  apply at once, as in the bar.
- **On a phone the panel shows the bar's selects.** At the theme's `xs` breakpoint the
  filter helpers render in the panel the selector they render in the bar, one row per
  filter, sized by `dialogBreakpoints` (theme slot `dialogRoot`):
  - `GridSingleSelectFilter`: a select instead of the list of radio buttons.
  - `GridMultiSelectFilter`: a multi-select instead of the list of checkboxes.
  - `GridMultiSelectFilterBackend`: the bar's `BackendMultipleSelect` instead of
    `BackendMultiSelect` (a selector with the list of the picked records and their
    remove buttons below it).

  The selects are outlined while their filter is active and take the same classes
  (`customFilterSingle`, `customFilterMulti`) as in the bar. `autocompleteId` is still used
  in the bar only. Wider than `xs` the panel keeps its lists, and it follows the viewport
  while it is open. `GridSingleSelectFilterBackend` renders the same selector in both
  places, as before.

- **Translations:** new keys `standalone.data-grid.custom-filters.reset` and
  `standalone.data-grid.custom-filters.show-results` in every locale. The panel no longer
  uses `standalone.data-grid.settings.close` (the column settings still do).

## Why

While the panel covers the rows and the header with "Reset filter" is hidden, nothing
showed what a pick did to the list, nothing reset the picks, and "Close" did not say that
the picks are kept. On a phone the panel's lists of every option made it several screens
tall; a select per filter keeps the filters and the footer on one screen, while wider
panels keep the lists, where an option is one click.

## Migration

Nothing to do for most apps: the helpers' props are unchanged.

- **Required for** app tests and scripts that close the panel with "Close": click "Show
  results".
- **Required for** app tests and scripts that pick a panel filter by its radio button or
  checkbox at a phone's width (`getByRole("radio", { name })`,
  `getByRole("checkbox", { name })`): open the filter's select (a combobox named by the
  filter's `label`) and pick the option from the list. For `GridMultiSelectFilterBackend`
  the panel on a phone no longer lists the picked records with "Remove …" buttons.
- **Required for** theme overrides and CSS that style the panel's radio or checkbox lists
  under the helpers' `dialogRoot` slot and should also apply on a phone: style the selects
  there through `customFilterSingle`/`customFilterMulti` (bar and phone panel) or
  `dialogRoot`.
- An app that overrides `standalone.data-grid.settings.close` to rename the panel's button
  overrides `standalone.data-grid.custom-filters.show-results` instead.
