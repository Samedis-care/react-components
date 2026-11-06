# LocaleSelectorDialog is full screen on phones, and its names wrap

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `non-standalone/LocaleSelector`

## What changed

- Below the theme's `sm` breakpoint `LocaleSelectorDialog` is a full-screen dialog, and
  its list fills the screen below the search box. From `sm` up it is 400px wide as
  before, with the list `calc(75vh - 128px)` tall.
- Country and language names wrap instead of being cut with an ellipsis, and a row grows
  with them. Rows are at least 70px tall, as before. The `title` tooltips stay.
- The language column is 120px wide, or 45% of the text area when that is less (on a
  phone), so the country column keeps room.

## Why

At 320px the country column was 12px wide, so every country showed as one letter, and
on desktop long names such as "Sonderverwaltungsregion Hongkong" were cut, with the full
text only in a tooltip that keyboard and touch users cannot open. With a larger default
font size the rows also stayed 70px tall and cut their text.

## Migration

Nothing to do. A theme override that sets the Paper's width through
`components.CcLocaleSelectorDialog.styleOverrides.root` (`"& .MuiPaper-root"`) applies to
the full-screen dialog too; wrap it in `theme.breakpoints.up("sm")` to keep phones full
screen. Overrides of `CcLocaleSelectorEntry`'s `root` or `text` slots that relied on
`height: 100%`, `overflow: hidden` or `white-space: nowrap` no longer get them.
