# The corner of a diagonal Matrix pair is drawn in its entry's text color

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Matrix`

## What changed

In a diagonal pair of `MatrixCellTile` (`pairLayout: "diagonal"`, a cell with two
entries), the first entry's `bottomLeft` corner adornment is now drawn in that entry's text
color: its `textColor`, or the black or white derived from its `backgroundColor`, or the
color picked for its faded fill when it is `dimmed`. That is the color of the entry's label,
and the color its corners already get in the split layout. It used to inherit the text
color around the grid, for example `rgba(0, 0, 0, 0.87)` on a light page and near-white in
a dark theme.

## Why

The corner sits on the entry's fill, where only the entry's text color is sure to be
readable. Drawn in the page's text color it had as little as 2.3:1 on a dark fill such as
`#0d47a1` in a light theme, and 1.1:1 on a light fill such as `#fff59d` in a dark theme.

## Migration

Nothing required. A corner that sets its own color keeps it. A corner that sets none (MUI
icons inherit theirs) now matches the entry's label in both layouts: expect this in
screenshots of diagonal pairs.
