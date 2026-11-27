# A long InlineSwitch label wraps beside the switch, and the switch stays on screen

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/InlineSwitch`, and so the switch of `BaseSelector` and
  `MultiSelectWithoutGroup` with `displaySwitch` and `switchLabel`, and of the selectors
  built on them

## What changed

A label too long for the space beside the switch wraps there, beside the switch: at a
space, and inside a word longer than that space at any character. Its lines have the
line height of the caption typography, and its first line is centered beside the switch
in a 30px row, as a short label is.

Before, such a label moved to a row of its own below the switch, in 30px high lines, and
a word longer than the row (a long compound word, or a normal word at a large text size)
widened the switch's float past the container. The float overflowed to the left, so the
switch sat left of the container, on a phone off the screen, where it could not be
scrolled to.

Switch and label are never wider than the container: with a long label they take its
width, and `children` start below them. A short label looks as before, and a switch
without label keeps a row as high as the switch.

In MultiSelectWithoutGroup's switch row, where the label comes before the switch, a long
label wraps before the switch in the same way, in lines of the caption's line height.

## Why

At 320px, or with larger text, a long label has to stay readable next to its switch and
the switch has to stay on screen (WCAG 1.4.10 Reflow, 1.4.4 Resize Text).

## Migration

Nothing to do; expect labels that wrap beside the switch in screenshots of a selector with
a long `switchLabel` on a narrow screen.

The row's 30px height no longer comes from `lineHeight: 30px` on the switch wrapper. A
theme that sets `lineHeight` in `CcInlineSwitch` `styleOverrides.switchWrapper` now sets
the line height of the label's lines; the first line stays centered in the row.
