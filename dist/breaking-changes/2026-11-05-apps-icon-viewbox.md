# AppsIcon shows both rows of squares, centered

- **Date:** 2026-11-05
- **Kind:** behavior
- **Scope:** `standalone/Icons`

## What changed

`AppsIcon`'s viewBox is `0 0 42.07 26.54` now, the bounds of its 3x2 grid of squares. It
was `0 0 42.07 15.69`, which ended where the second row begins.

- Sized by `fontSize` (24px by default), the grid is centered vertically in the icon's
  square box. It used to sit 3px below center at 24px (about an eighth of the icon's size).
  Its size is unchanged.
- Sized by width only, for example `sx={{ width: 16, height: "auto" }}`, the box takes the
  grid's aspect ratio: 16x10px, with both rows of squares. It used to be 16x6px, and only the
  top row showed; the bottom row was drawn outside the box and clipped.

Neither the library nor samedis-ui or identity-management-frontend use `AppsIcon` today (the
DataGrid's custom-filter button shows MUI's `Apps` icon).

## Why

The glyph has two rows of squares, but the viewBox covered only the first, so the icon was
off center and lost its bottom row when sized by width.

## Migration

Nothing to do. An app that shows `AppsIcon` sees the grid move up to the center of its box,
and, where the icon is sized by width only, a taller box with both rows.
