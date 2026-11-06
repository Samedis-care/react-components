# FilterActiveIcon is removed

- **Date:** 2026-11-05
- **Kind:** type
- **Scope:** `standalone/Icons`

## What changed

`FilterActiveIcon` no longer exists. It is gone from `standalone/Icons` and from the
package root. Nothing in the library rendered it: the DataGrid's filtered column-header
slot, `DataGridColumnHeaderFilterActiveIcon`, draws `FilterIcon` and is unchanged.

## Why

Its glyph, a funnel with an "x" at the top right, is the common "clear filter" symbol (MUI's
`FilterAltOff` and `FilterListOff`). A button that showed it to mean "filters are set" read as
"remove the filter". Its funnel was also narrower than `FilterIcon`'s and sat left of center,
so the funnel shrank and jumped when it replaced `FilterIcon`.

## Migration

**Required for every app that imports `FilterActiveIcon`.** Without this change, the import
fails to compile, and the component is `undefined` at runtime, so React throws ("Element type
is invalid") wherever the icon would render.

Show the active state with MUI's own pair from `@mui/icons-material`: `FilterAltOutlined`
when no filter is set and `FilterAlt` (filled) when one is:

```tsx
import { FilterAlt, FilterAltOutlined } from "@mui/icons-material";

{filtersActive ? <FilterAlt /> : <FilterAltOutlined />}
```

In samedis.care this is the filter button of the search-and-browse page
(`src/pages/TenantSpecific/components/SearchAndBrowse/BrowseContainer.tsx`), tracked in
Samedis-care/samedis-care-issues#3651.
