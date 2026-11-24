# The SignPad tile is a block, as tall as its min-height without a sized parent

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/SignPad`, and through it `non-standalone/SignaturePad` and the
  form renderer of `TypeSignature`

## What changed

- The tile's root (slot `root` of `CcSignPad`) is a block-level flex column instead of
  `display: inline-block`. In a block parent, the parent is now exactly as tall as the
  tile. Before, the tile sat on a line of text, and the line added space next to it: 17px
  above an unsigned tile at the default font, so a plain `div` around a 100px tile was
  118px tall and two stacked tiles were 17px apart.
- In a parent without a definite height, an unsigned tile is 100px tall (its
  `min-height`); it was 101px. The tile's button took the whole min-height and the 1px
  bottom border came on top. The button now grows to the tile's height inside the border
  (`flex-grow: 1` instead of `min-height: inherit`), so it is 99px tall there.
- Unchanged: a tile in a parent of definite height (it fills the parent, as before) and a
  signed tile, whose height follows its preview as before.

## Why

The tile is a field of its own, not a word on a line of text: it should take exactly its
own height in any parent, like the other fields.

## Migration

Nothing to do where the tile sits in a wrapper of a fixed height: the wrapper keeps its
height. The signature field of a model form (a flex column, where the line gap never
appeared) is 1px shorter.

A layout that relied on the space next to the tile, e.g. two tiles stacked in a plain
`div`, adds the space itself: a `Stack` with `spacing` around the tiles, or a margin on
the element that wraps each tile.

Required for a theme that sets `display` in `components.CcSignPad.styleOverrides.root`:
keep it a flex column (`display: "flex", flexDirection: "column"`). Otherwise the button
does not grow to the tile's height in a parent without a definite height, so its focus
ring shrinks to the size of its content.
