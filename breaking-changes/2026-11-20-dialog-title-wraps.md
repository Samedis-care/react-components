# DialogTitle wraps a long title instead of cutting it off

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog/DialogTitle` (also FullFormDialog and LocaleSelectorDialog, which render it)

## What changed

- A title too long for one line wraps onto more lines, like MUI's `DialogTitle`. Before, it
  stayed on one line and was cut with an ellipsis; the heading (the `text` slot) no longer
  has `white-space: nowrap`, `overflow: hidden` or `text-overflow: ellipsis`.
- A word wider than the line breaks where it has to (`overflow-wrap: anywhere` on the
  heading). Titles without such a word wrap between words only.
- Content after the title text inside the heading wraps with it: a title that is a row of
  elements (e.g. one set with `useSetFormDialogTitle`) is no longer clipped at the heading's
  edge.

Titles that fit on one line look exactly as before. On a 320px wide screen a title has about
176px beside the close button, about 17 characters of MUI's default 20px title font, so
longer titles (device names in a FullFormDialog, for example) now take more lines there.

## Why

At 320px wide (a phone, or a desktop browser zoomed to 400%) the title had about 176px next
to the close button, so a long title showed only its first word or two, and nothing showed
the rest (WCAG 1.4.10 Reflow, 1.4.4 Resize Text).

## Migration

Nothing to do. Expect multi-line titles in screenshots of dialogs on phones, and a taller
title row. A theme that wants one line with an ellipsis back sets
`{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }` in
`components.CcDialogTitle.styleOverrides.text`.
