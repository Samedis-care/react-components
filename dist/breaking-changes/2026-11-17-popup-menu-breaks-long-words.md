# PopupMenu breaks a word too long for a line

- **Date:** 2026-11-17
- **Kind:** behavior
- **Scope:** `standalone/PopupMenu`

## What changed

A `PopupMenu` item label that holds a word wider than the item breaks that word onto more
lines. Before, item labels wrapped at spaces only (since
[2026-11-12](2026-11-12-popup-menu-labels-wrap.md)), so such a word stayed on one line and
the paper cut it off without an ellipsis. Only a word that doesn't fit on a line is broken;
labels without such a word look as before.

This works for a label that is the item's own text (every library menu: the DataGrid menus,
including the data actions an app passes in `customDataActionButtons`, and the FilesGrid file
list) and for a MUI `ListItemText`. Other elements beside the label, such as a shortcut hint,
keep their words whole.

On a 320px wide screen this reaches words of more than about 30 characters of 16px text
(fewer next to an icon): German compound words in a data action's label, and file names
without spaces in the FilesGrid menu.

## Why

At 320px wide (a small phone, or a desktop browser zoomed to 400%) an item's text is about
254px wide, 218px next to an icon, and a longer word could not be read in full (WCAG 1.4.10
Reflow).

## Migration

Nothing to do. A label in an element other than `ListItemText` (a `Typography`, a `span`)
breaks a too-long word only if that element may get narrower than the word: give it
`min-width: 0`, or use `ListItemText`.
