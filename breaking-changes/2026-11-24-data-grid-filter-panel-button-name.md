# The DataGrid's filter panel button is named "Filter selection" and says whether the panel is open

- **Date:** 2026-11-24
- **Kind:** behavior, i18n
- **Scope:** `standalone/DataGrid` (the button that replaces the filter bar in dialog mode,
  `Header/CustomFiltersButton`)

## What changed

- In dialog mode (`enableFilterDialogWidth` or `enableFilterDialogMediaQuery`), the button
  that opens the filter panel still shows "Filter", but its accessible name is now
  "Filter selection". The name starts with the visible text in every locale: "Filter
  auswählen", "Filtrar: selección de filtros", "Filtre : sélection de filtres", "Filtro:
  selezione dei filtri", "Filter selecteren", "Фильтр: выбор фильтров", "Filtr: filtrlarni
  tanlash".
- The name comes from the new key `standalone.data-grid.header.custom-filter-button-label`.
  The visible text keeps its key, `standalone.data-grid.header.custom-filter-button`.
- The button has `aria-expanded`: `"true"` while the panel is open, `"false"` otherwise.
- An `aria-label` or `aria-expanded` passed to `CustomFiltersButton` replaces the button's
  own.

Nothing changes on screen.

## Why

The filter button in every column header is named "Filter" too, so a screen reader or voice
control user heard "Filter, button" for all of them and could not tell them apart. Nothing
told assistive technology whether the panel was open.

## Migration

Nothing to do for the DataGrid's own button.

Required for tests that find the panel button by its name "Filter" (for example
`getByRole("button", { name: "Filter" })`): find it by the name "Filter selection".
Otherwise they find a column header's filter button, or nothing.

Required for any app that renders `CustomFiltersButton` itself, for an action other than
opening the grid's filter panel (for example a "Filter" button in its own filter bar that
goes back to a page where the filters are chosen): the button now announces itself as
collapsed, although it expands nothing. Pass `aria-expanded={undefined}` to remove that,
and an `aria-label` that starts with "Filter" if "Filter selection" does not describe the
action:

```tsx
<CustomFiltersButton onClick={goBack} aria-expanded={undefined} />
```
