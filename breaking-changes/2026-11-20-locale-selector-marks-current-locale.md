# The locale selector marks the row of the current locale

- **Date:** 2026-11-20
- **Kind:** behavior, theme
- **Scope:** `non-standalone/LocaleSelector` (`LocaleSelectorDialog`'s rows)

## What changed

The row of the current locale (`getCurrentLocale(ComponentsCareI18n)`, e.g. `de-AT`) is
marked in three ways:

- MUI's selected look: the row button gets `selected`, so the `Mui-selected` class and
  MUI's tint of `palette.primary.main` (`action.selectedOpacity`)
- a check icon in `palette.primary.main` at the row's end, after the language name. When
  the name and the check don't fit side by side (at 320px, e.g. "Nederlands"), the check
  moves to the row's second line, which the current row never uses (it is in the UI
  language, so it shows no native names)
- `aria-current="true"` on the row button, so screen readers say "current"

A current locale without a region (`"de"`, `"en"`) marks the row of its most likely region
(`de-DE`, `en-US`), the one its date and number formats follow. A current locale that has
no row (e.g. `en-DE`, or a language the dialog doesn't offer) marks no row.

The language name in the UI language now sits in a new `language` cell (a flex box) inside
`textContainer`, which in the current row also holds the check. Two new theme slots of
`CcLocaleSelectorEntry`: `language` and `currentIcon` (the check). The `text` slot is
unchanged and still styles every name.

## Why

Nothing said which row was active: every row read the same ("United States English,
button"), and with the UI in `de-AT` and the browser in English, Österreich was somewhere
down the list and unmarked (WCAG 1.3.1, 4.1.2). The check makes the mark visible without
relying on color (the tint disappears in forced colors, the check stays).

## Migration

Nothing to do, but expect the tinted row with a check in screenshots of the locale dialog.
To restyle it, override `&.Mui-selected` in `CcLocaleSelectorEntry`'s `root`
`styleOverrides`, or the `currentIcon` slot. A theme override that targeted the language
name through the grid's children (`textContainer > :nth-child(2)`) now matches the
`language` cell; use the `language` slot.
