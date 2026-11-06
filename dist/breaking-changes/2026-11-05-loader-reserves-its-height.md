# The Loader takes up the height of its content in a parent of automatic height

- **Date:** 2026-11-05
- **Kind:** behavior
- **Scope:** `standalone/Loader`

## What changed

- In a parent of automatic height (normal block flow, a Grid item, a `DialogContent`, a
  flex container sized by its content), the Loader is as tall as its content: 70px for the
  spinner, plus the text when it has one. It used to be 0px tall and draw its spinner and
  text over the content above and below it. When loading ends, the layout now goes from
  the Loader's height to the content's, not from 0.
- In a parent with a definite height, the Loader still fills it and centers its content.
  Without `text` nothing moves. With `text`, the text and the spinner's 70px box are
  centered as one block, so both sit higher than before by half the text's height (16px
  for one line of the default `h6`).
- The slots are laid out differently: `root` is a flex column that centers
  `innerWrapper`, `innerWrapper` is in normal flow (no absolute positioning, no fixed
  height), and `outerProgressWrapper` is 70px tall.

## Why

The Loader positioned its content absolutely inside a box of `height: 100%`. A parent of
automatic height resolves that to 0px, so the Loader reserved no space and covered its
surroundings, and a `DialogContent` holding only a Loader showed a clipped spinner.

## Migration

Nothing required. A wrapper that exists only to give the Loader room in a parent of
automatic height (a fixed height or `minHeight` around it, or an absolutely positioned
box) can go. Expect a Loader with `text` in a sized box to sit higher in screenshots.

A theme that overrides layout properties (`position`, `height`, `top`, `transform`) of the
`root`, `innerWrapper` or `outerProgressWrapper` slots: check it against the new layout.
