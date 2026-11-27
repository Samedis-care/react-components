# A Matrix entry draws what does not fit it smaller, and a stacked pair puts its secondary label beside the label

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/Matrix` (`MatrixCellTile`, `MatrixTileItem`)

## What changed

- **Content that does not fit its entry is drawn smaller.** An entry's label, arrow and
  `secondaryLabel` are scaled down together, just as far as they need to fit the entry, but no
  text below 8px; what is wider even at 8px is cut, as before. The entry measures its content
  and follows every change of either: a narrower column or lower row, another label, a font
  that finishes loading, or text spacing a user applies. Content that fits keeps its size, and
  nothing is drawn larger than before. A `secondaryLabel` that is a node (an icon, your own
  markup) is scaled with the rest.
- **A stacked pair puts the secondary label beside the label.** In a split pair stacked one
  above the other (`MatrixCellTileProps.splitDirection` `"column"`), each entry draws its
  `secondaryLabel` after its label in one line ("F → ICU"), whatever its `flow` says. A single
  entry and a side-by-side pair keep their `flow`.
- The scale is a CSS `scale` on the `itemContent` slot, set through the new custom property
  `matrixVars.tileFit` (`--cc-matrix-tile-fit`, unset while the content fits). The slot now
  keeps its natural size instead of shrinking to the entry's (`flexShrink: 0`; its
  `minWidth: 0` is gone).

## Why

Labels were sized by their length alone and cut wherever the entry had less room than that
size needed. A stacked entry is about 25px high at `MatrixGrid`'s default `rowHeight`, so the
default vertical flow (label, arrow and secondary label one below the other, about 40px) lost
its top and bottom. Codes of three or four characters lost their sides in a side-by-side pair,
and with the text spacing WCAG 1.4.12 asks content to survive (letter spacing 0.12em, line
height 1.5), two-letter codes such as "MW" in a pair and "F → ICU" in the horizontal flow were
cut too.

## Migration

Nothing to do. Expect in screenshots and tests:

- Codes that did not fit their entry are drawn smaller, for example a three-letter code of wide
  letters in a side-by-side pair at the default sizes.
- A stacked pair whose entries have the default vertical flow shows "F → ICU" in one line.
- A theme `styleOverrides` entry for the `itemContent` slot that lets it shrink again
  (`flexShrink`, `maxWidth`, `minWidth`) keeps the entry from measuring what its content needs:
  leave the slot's size alone.
