# A diagonal Matrix pair goes through renderItem

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/Matrix`

## What changed

`MatrixCellTile` now calls `renderItem` for a diagonal pair (`pairLayout: "diagonal"`, a
cell with two entries). It is called once, with the first entry, around the whole pair;
when either entry is highlighted, the node it gets is the pair inside its highlight ring,
as for a single entry. It used to render the pair without calling `renderItem`.

## Why

`pairLayout` documents the pair as one drag handle that reports the first entry, like its
click. An app that makes its entries draggable with a `renderItem` wrapper got no drag
handle in a cell holding two entries, so neither of them could be moved in the diagonal
layout.

## Migration

Nothing required. In the diagonal layout a cell holding two entries is now wrapped by your
`renderItem`, so a drag handle there moves the first entry. The second entry of a pair can
only be dragged in the split layout. A `renderItem` that decides per entry (for example,
returns the node unwrapped for an entry that may not be moved) decides for the pair by its
first entry.
