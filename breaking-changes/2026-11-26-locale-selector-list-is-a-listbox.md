# The locale selector's list is a listbox: one tab stop, and the arrow, page, Home and End keys move between its rows

- **Date:** 2026-11-26
- **Kind:** behavior, theme, type
- **Scope:** `non-standalone/LocaleSelector` (`LocaleSelectorDialog`'s list and rows)

## What changed

- The list is a listbox (`role="listbox"`), named by the dialog's title ("Select your
  country and language"). Each row is an option (`role="option"`, the row's
  `ListItemButton`) with `aria-posinset` and `aria-setsize`. The rows' wrappers have no
  role anymore; before, the list was an unnamed `role="list"` of `listitem`s that each
  held a `role="button"`.
- The row of the current locale is marked `aria-selected="true"` instead of
  `aria-current="true"`; the other rows have `aria-selected="false"`. The tint and the
  check stay as they are.
- The list is one tab stop (a roving tabindex): only its active row has
  `tabindex="0"`, the others `tabindex="-1"`. The active row is the row focused last;
  when the dialog opens, the current locale's row (else the first); after a search,
  the first match.
- ArrowDown and ArrowUp move focus to the next and previous row, PageDown and PageUp by
  the rows in view, End and Home to the last and first row, without wrapping. The list
  scrolls the focused row into view, also when it was not rendered yet. These keys no
  longer scroll the list natively. While a picked language loads, they keep focus on
  the picked row.
- While the active row is scrolled out of the rendered range (the wheel, a swipe or
  the scrollbar), the list element itself is the tab stop (`tabindex="0"`, before
  always `"-1"`). Tab or Shift+Tab into it scrolls the active row back into view and
  focuses it. A click on the list's scrollbar or empty part still only focuses the
  list.
- `components.CcLocaleSelectorEntry.defaultProps` takes `active` (default `false`), and
  the entry's props have `position` and `count`; the list sets all three on each row.

## Why

Each of the up to 261 rows was a tab stop of its own: reaching the last row took 220
Tabs, leaving the list forwards meant tabbing past every row, and the arrow keys only
scrolled. Screen readers found an unnamed list with the ten or so rendered rows
(WCAG 2.4.3, 1.3.1). The listbox follows the WAI-ARIA Authoring Practices listbox
pattern and MUI's Select menu.

## Migration

Nothing to do in an app that only opens the dialog. Tests that find the rows by role
`listitem` or `button`, or the current row by `aria-current`, now use `option` and
`aria-selected="true"`; tests that tab from row to row use the arrow keys. A theme
override of the list's focus ring targets `& [role="listbox"]:focus-visible` in the
`localeList` slot of `components.CcLocaleSelectorDialogContent.styleOverrides`
(before `& [role="list"]:focus-visible`).
