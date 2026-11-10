# FilterIcon, SignIcon and ExportIcon are padded like Material icons

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `standalone/Icons` (`FilterIcon`, `SignIcon`, `ExportIcon`); where the library
  shows them: the DataGrid header's Export button and SignPad

## What changed

The three icons draw the same glyph in the same box (1em square, 24px at the default
`fontSize`), but smaller inside it: like a Material icon, the glyph is fitted into a Material
keyline shape on the 24-unit grid and centered, with padding around it. Only their `viewBox`
changed.

| Icon         | Keyline        | Glyph at 24px, before → after | `viewBox` before → after                       |
| ------------ | -------------- | ----------------------------- | ---------------------------------------------- |
| `FilterIcon` | square 18×18   | 24×24 → 18×18                 | `0 0 26 26.02` → `-4.347 -4.337 34.693 34.693` |
| `SignIcon`   | square 18×18   | 24×24 → 18×18                 | `0 0 36 36` → `-6 -6 48 48`                    |
| `ExportIcon` | portrait 16×20 | 18×24 → 15×20                 | `0 0 27 36` → `-8.1 -3.6 43.2 43.2`            |

At any other size the glyph scales with the box: at `fontSize="small"` (20px) FilterIcon and
SignIcon are 15×15 and ExportIcon 12.5×16.7.

Visible changes:

- DataGrid header: the Export button's Excel glyph is as large as the Import button's
  `Publish` next to it, on desktop (with label), on tablets (icon button) and in the phone's
  More options menu.
- SignPad: the pen next to the "Sign here digitally" prompt is 18px instead of 24px.

Props, types and the size of the box are unchanged.

## Why

Material icons are drawn on a 24-unit grid with padding around the glyph, while these icons
reached the edges of their box. Next to a Material icon of the same `fontSize` they looked
about a third larger and heavier. They now look like they belong with the Material icons
around them.

## Migration

Nothing is required.

Code that shrank or offset one of these icons so that it matched the Material icons next to
it (a smaller `fontSize`, `padding`, a `width`) now makes it too small. Remove that override.

samedis-ui: the mobile grid's search field (`SamedisMobileBackendDataGrid`) shows
`FilterIcon` without an override, so its funnel is now 18px, the size of the Search icon at
the other end of the field; nothing to change. identity-management-frontend shows none of the
three directly.

Recommended for samedis-ui and identity-management-frontend: both apps pass their own copy of
the Excel glyph (`ExcelExportIcon`, `viewBox="0 0 27 36"`) as the Excel exporter's `icon`, so
the export menu still draws it edge to edge (18×24 at 24px) while the Export button that opens
the menu draws the padded one. Pass `ExportIcon` from `components-care` instead and delete the
copy; it is the same glyph and, like a Material icon, a `SvgIconComponent`.
