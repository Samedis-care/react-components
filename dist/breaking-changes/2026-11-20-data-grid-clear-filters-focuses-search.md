# "Clear filters" in an empty DataGrid moves focus to the search box

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (the placeholder shown when the filters match no
  rows), and so `BackendDataGrid`

## What changed

- "Clear filters" moves focus to the grid's search field before it clears the filters
  and disappears with them. The field is empty then, and focus stays there while the
  grid reloads. Below sm, where the search box is a button that opens the field in a
  popover, focus moves to that button.
- This happens however the button is pressed: keyboard, mouse or touch. On a touch
  device with the grid at sm or wider, the focused field opens the on-screen keyboard,
  as a search box does when tapped.

## Why

The button removed itself along with the filters, so keyboard focus fell to the page.
The next Tab started from wherever the browser kept its focus starting point, and a
screen reader's virtual cursor could start over at the top of the page (WCAG 2.4.3).

## Migration

Nothing to do, but expect the focused search field in screenshots taken after
"Clear filters".
