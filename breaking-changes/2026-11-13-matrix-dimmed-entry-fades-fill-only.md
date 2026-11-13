# A dimmed Matrix entry fades its fill only, and its label is picked for the faded fill

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/Matrix`

## What changed

A dimmed entry of `MatrixCellTile` (`MatrixTileItem.dimmed`) is now drawn the same way in
the split and the diagonal layout:

- Its fill is faded to `MATRIX_TILE_DIM_OPACITY` (the fill's alpha is multiplied by it),
  as before.
- Its label, secondary label, arrow and corners are no longer faded. In the split layout
  the whole entry used to be drawn at `opacity: 0.6`; in a diagonal pair the dimmed half's
  label was faded once more on top of its faded fill.
- Its label is black or white, whichever has the higher contrast with the faded fill as it
  shows over the theme's `palette.background.paper`. `textColor` is not used while the
  entry is dimmed, since it was meant for the full fill. On a light theme the white label
  of a dimmed entry turns black.
- A dimmed `backgroundColor` that cannot be resolved (a `var()`) is not faded and keeps
  `textColor`, in both layouts. In the split layout such an entry used to be faded as a
  whole.
- A dimmed entry looks the same with keyboard focus. The fade used to be lifted while it
  was focused.
- `MATRIX_TILE_DIM_OPACITY` is the opacity of a dimmed entry's fill, no longer of the whole
  entry.
- The state classes `CcMatrixCellTile-itemDimmed` and `CcMatrixCellTile-diagonalLabelDimmed`
  are still set, but no longer carry an opacity.

## Why

A dimmed entry is still content people read and click. Faded together with its fill, a
white label had 2.4-3.6:1 on the white grid, and 1.8-2.3:1 in a diagonal pair: below the
4.5:1 that WCAG 1.4.3 asks of the tile's small labels, and different in the two layouts. A
label picked for the faded fill has at least 4.5:1 in both.

## Migration

**Required for apps that draw their own sample of a dimmed entry**, such as a legend that
sets `opacity: MATRIX_TILE_DIM_OPACITY` on a box imitating an entry. Such a sample now
differs from the real entry: its label is faded and keeps its color, the entry's label is
neither. Draw the sample with `MatrixCellTile` and a dimmed item in a sized box, so it
comes from the same code as the grid:

```tsx
<Box sx={{ width: 20, height: 20 }}>
	<MatrixCellTile
		items={[
			{ key: "sample", label: "F", backgroundColor: "#218895", dimmed: true },
		]}
	/>
</Box>
```

Recommended: a corner adornment that sets the entry's `textColor` as its own color keeps
that color on a dimmed entry, where the label has turned black or white. Leave its color
unset (MUI icons inherit by default) so it follows the label.
