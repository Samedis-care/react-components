# The grid filter helpers take their default from defaultCustomData, and the Filter button follows the custom data

- **Date:** 2026-11-06
- **Kind:** type, behavior
- **Scope:** `standalone/DataGrid` (`GridSingleSelectFilter`, `GridMultiSelectFilter`, the
  "Filter" button of the filter bar's dialog mode, `CustomFilterActiveContext`)

## What changed

- `GridSingleSelectFilter` and `GridMultiSelectFilter` no longer take `defaultSelection`. They
  take a required `field`: the key of the grid's custom data that the filter edits. The value
  of that key in the grid's `defaultCustomData` is the filter's default. While `selected` is
  unset (`undefined` or `null`), the filter shows that default (no option if the grid has
  none). While the selection differs from it, the bar outlines the filter.
- "Differs" follows one rule, exported as `isDataGridCustomFilterActive(value, defaultValue)`.
  Empty values (`undefined`, `null`, `""` and `[]`) count as unset, so they are equal to each
  other. Lists are equal when they hold the same entries in any order.
- In dialog mode (`enableFilterDialogWidth` or `enableFilterDialogMediaQuery`), the "Filter"
  button's icon carries `CcDataGrid-customFilterActiveIcon` while the grid's custom data holds
  an active filter: a key of the custom data, or of `defaultCustomData`, whose value is active by
  that rule. The rule is exported as `areDataGridCustomFiltersActive(customData, defaultCustomData)`.
  The marker no longer depends on which filter controls are mounted, and an app's own controls
  count like the helpers.
- `CustomFilterActiveContext` and `useCustomFilterActiveContext` (`Header/FilterBar`) are
  removed. The helpers no longer report into a counter. `GridSingleSelectFilterBackend` and
  `GridMultiSelectFilterBackend` still outline any selection.

## Why

The helpers had a default of their own next to the grid's `defaultCustomData`, which "Reset
filter" restores. Apps had to repeat every default, and the two could disagree.

The "Filter" button counted only the helpers that were mounted, and the helpers mount with the
filter panel. Before the panel had been opened once, the button stayed unmarked, although
stored, overridden or URL custom data filtered the list. An app's own controls in the filter bar
never marked it. A Backend filter preset through `defaultCustomData` stayed marked after "Reset
filter".

## Migration

Required for every `GridSingleSelectFilter` and `GridMultiSelectFilter`. TypeScript reports
each one, because `field` is missing and `defaultSelection` no longer exists.

1. Replace `defaultSelection={…}` with `field="<key>"`, the custom data key that the filter's
   `selected` and `onSelect` read and write. Pass the raw value as `selected` and drop
   fallbacks such as `?? ""` or `?? DEFAULT`, so that an unset value shows the default. With
   `?? ""`, a key that is missing from the custom data (for example after a link with
   `overrideCustomData`) shows the empty option, which is outlined against a non-empty default.

   ```tsx
   // before
   <GridSingleSelectFilter
     selected={(customData["filter[status]"] as string) ?? ""}
     defaultSelection={"active"}
     onSelect={(status) =>
       setCustomData((prev) => ({ ...prev, "filter[status]": status }))
     }
     options={STATUS_OPTIONS}
     dialog={inDialog}
   />
   // after: the grid has defaultCustomData={{ "filter[status]": "active" }}
   <GridSingleSelectFilter
     field="filter[status]"
     selected={customData["filter[status]"] as string | undefined}
     onSelect={(status) =>
       setCustomData((prev) => ({ ...prev, "filter[status]": status }))
     }
     options={STATUS_OPTIONS}
     dialog={inDialog}
   />
   ```

2. Required where a non-empty default was only in `defaultSelection`: put it into the grid's
   `defaultCustomData` under the filter's key. Without it, an unset value no longer shows that
   default, "Reset filter" does not restore it, and picking it outlines the filter and marks the
   "Filter" button. Empty defaults (`""`, `[]`) need no entry.
3. Required for a helper whose value is not a custom data key, such as a view that `onSelect`
   writes into several keys: no `field` fits, so its default cannot come from
   `defaultCustomData`, and the helper is outlined whenever the view is not empty. Give the view
   a key of its own in the custom data, which the filter bar or `getAdditionalFilters` maps to
   the filters, or use a control of your own instead of the helper.
4. Required for an app that renders the filter bar in a dialog of its own and reads
   `CustomFilterActiveContext` to mark its button: remove the provider and compute the marker
   from the dialog's custom data with
   `areDataGridCustomFiltersActive(customData, defaultCustomData)`. The helpers still need
   `DataGridPropsContext` with the grid's props, from which they read `defaultCustomData`. They
   no longer need to stay mounted (`keepMounted`) for the marker.
5. Controls of your own in the filter bar mark the "Filter" button when they change the custom
   data; nothing to do. To outline them like the helpers, use
   `isDataGridCustomFilterActive(customData[key], defaultCustomData?.[key])`.
