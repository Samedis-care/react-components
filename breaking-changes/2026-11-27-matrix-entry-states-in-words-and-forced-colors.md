# A Matrix entry says its state and its arrow, its ring stands out, and forced colors keep its shape

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/Matrix` (`MatrixCellTile`, `MatrixTileItem`)

## What changed

- **Screen readers** hear what the tile shows:
  - A highlighted or dimmed entry (`MatrixTileItem.highlighted`, `.dimmed`) says so after its
    label: "F, highlighted", "F, dimmed", "F, highlighted, dimmed".
  - The arrow before a `secondaryLabel` is said as a word: "F to ICU" (before: "F ICU").
  - This is part of a clickable entry's name and is read with a read-only entry. Each half of
    a diagonal pair says its own state after its label ("F, highlighted S"), and the "+N"
    marker says the state of each entry it stands for ("2 more: N, highlighted (Night shift),
    RD").
  - The words are in the page's language. New translation keys
    `standalone.matrix.tile-arrow`, `standalone.matrix.tile-highlighted` and
    `standalone.matrix.tile-dimmed`, in every locale.
- **The highlight ring** (around a highlighted entry, a diagonal pair with a highlighted
  entry, and the "+N" marker) has a 1px line of `palette.background.paper` between the
  element and the ring, then a 2px ring; it used to be a 3px ring directly on the fill. Its
  color is `palette.warning.main`, darkened (in a dark theme: lightened) just enough for 3:1 on
  today's column. In MUI's default light theme that is `rgb(213, 97, 1)` instead of `#ed6c02`;
  MUI's default dark theme keeps `warning.main`.
- **Forced-colors mode** (Windows contrast themes), which draws no fills, box shadows or
  gradients:
  - every entry has a border in the text color, dashed for a dimmed entry outside a diagonal
    pair;
  - a diagonal pair has a border, and its cut is a line in the text color;
  - the highlight ring is a 3px outline in the `Highlight` system color.
- The `MatrixTileItem.dimmed` documentation no longer calls a dimmed entry "not actionable":
  with `onItemClick`, a dimmed entry is a button like any other.

## Why

Whether an entry was highlighted or dimmed, and what its arrow meant, existed only visually
(WCAG 1.3.1, 1.4.1). The ring had 1.01:1 next to an orange entry and 2.67:1 in today's
column, whose tint is the ring's own color (WCAG 1.4.11). In forced-colors mode two entries
of a pair ran together into one box of text, and the ring and the diagonal cut were gone.

## Migration

**Required for any app that passes an icon (or anything else without text) as
`secondaryLabel`:** give it a name, or screen readers say "F to" with nothing after it. For a
MUI icon, pass `titleAccess`:

```tsx
secondaryLabel: <PanToolOutlined titleAccess={t("open for takeover")} sx={{ fontSize: 15 }} />,
```

Otherwise nothing to do. Expect in screenshots and tests:

- The ring looks a little different: a thin line of the background, then a thinner, in a light
  theme slightly darker ring.
- Tests that find a highlighted or dimmed entry by its exact name
  (`getByRole("button", { name: "F" })`) need the state words (`{ name: "F, highlighted" }`)
  or a pattern (`{ name: /^F\b/ }`). An entry with a `secondaryLabel` is named "F to ICU".
- A tooltip that already spells out the state ("new", "other team") is read as the
  description, after the state word in the name.
