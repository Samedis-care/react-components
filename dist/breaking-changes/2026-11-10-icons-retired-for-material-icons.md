# TuneIcon, ResetIcon, SuccessOutlinedIcon and AppsIcon are replaced by Material icons

- **Date:** 2026-11-10
- **Kind:** type, behavior
- **Scope:** `standalone/Icons`, `standalone/DataGrid` (header), `standalone/InfoBox`

## What changed

`TuneIcon`, `ResetIcon`, `SuccessOutlinedIcon` and `AppsIcon` no longer exist. They are gone
from `standalone/Icons` and from the package root, and so are their files
(`components-care/dist/standalone/Icons/TuneIcon` and the like). Where the library showed them,
it now shows the Material icon from `@mui/icons-material`:

| Removed               | Replaced by | Where the library shows it                                                        |
| --------------------- | ----------- | --------------------------------------------------------------------------------- |
| `TuneIcon`            | `Tune`      | DataGrid header: the Columns button, and Columns in the phone's More options menu |
| `ResetIcon`           | `Refresh`   | DataGrid header: the Reset button, and Reset in the phone's More options menu     |
| `SuccessOutlinedIcon` | `TaskAlt`   | InfoBox with `status="success"`                                                   |
| `AppsIcon`            | `Apps`      | nowhere (the DataGrid's custom filter button already shows `Apps`)                |

Visible changes:

- The DataGrid's Columns and Reset buttons show Material's lighter, padded sliders and
  circular arrow, the same size and weight as the Import button's `Publish` next to them.
- InfoBox's success icon looks almost the same: `TaskAlt` is the same check mark in an open
  circle.

`FilterIcon`, `SignIcon` and `ExportIcon` stay.

## Why

These four icons had an equal or close Material icon. Next to the Material icons around them
they looked out of place: drawn edge to edge instead of on Material's padded 24-unit grid,
heavier and larger at the same `fontSize`. The library's own icons are meant to look like
they belong with Material's.

## Migration

**Required for every app that imports `TuneIcon`, `ResetIcon`, `SuccessOutlinedIcon` or
`AppsIcon` from `components-care`** (or deep-imports their files). Without this change, the
import fails to compile, and the component is `undefined` at runtime, so React throws
("Element type is invalid") wherever the icon would render. Import the Material icon from the
table instead; it takes the same props (`SvgIconProps`):

```tsx
// before
import {
	TuneIcon,
	ResetIcon,
	SuccessOutlinedIcon,
	AppsIcon,
} from "components-care";

// after
import { Apps, Refresh, TaskAlt, Tune } from "@mui/icons-material";
```

samedis-ui and identity-management-frontend import none of the four, so their code needs no
change. Their DataGrid headers show the new Columns and Reset icons, so expect them in
screenshots.
