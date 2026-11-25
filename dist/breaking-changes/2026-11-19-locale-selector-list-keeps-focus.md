# The locale selector keeps keyboard focus in its list while it scrolls

- **Date:** 2026-11-19
- **Kind:** behavior
- **Scope:** `non-standalone/LocaleSelector` (`LocaleSelectorDialog`'s list)

## What changed

- The list renders only the rows in view. When the row that has keyboard focus is
  scrolled away (the wheel, a swipe, or the arrow, page, Home and End keys, which scroll
  the list), the list itself takes focus, without scrolling. The keys keep scrolling the
  list, Tab goes on to the rows, and Shift+Tab goes back to the search box.
- When the list is scrolled back to that row, the row gets focus back. If focus moved
  elsewhere meanwhile (to another row, or out of the list), it stays there.
- A row picked with the keyboard keeps focus while its language loads.
- The list element (`role="list"`) has `tabindex="-1"`: it can hold focus, but it is no
  tab stop of its own. A click on an empty part of the list focuses the list.
- While the list holds keyboard focus, it draws the library's focus ring: a 2px solid
  outline in `palette.primary.main`, inside its edges.

## Why

Focus fell out of the list when the focused row was scrolled away, or when a picked
row started loading its language. MUI's focus trap then moved it to the unnamed dialog
container: the arrow keys did nothing anymore, the next Tab started over at the close
button, and screen readers announced nothing useful (WCAG 2.4.3, 2.1.1).

## Migration

Nothing to do, but expect the ring around the list in screenshots taken after scrolling
away from a focused row. To restyle it, override `& [role="list"]:focus-visible` in the
`localeList` slot of `components.CcLocaleSelectorDialogContent.styleOverrides`.
