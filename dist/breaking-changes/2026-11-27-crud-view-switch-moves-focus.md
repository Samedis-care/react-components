# A CRUD moves the keyboard focus into the view it opens, and back to the list's opener

- **Date:** 2026-11-27
- **Kind:** behavior, theme
- **Scope:** `backend-components/CRUD`

## What changed

- While a record page (also `new`) or the importer shows, CRUD renders it inside a `div`,
  the new theme slot `components.CcCrud.styleOverrides.view`. Like the grid's wrapper
  (`gridWrapper`), it fills the CRUD's parent (width and height 100%). Before, the record
  page's form and the importer were direct children of the CRUD's parent.
- When a view opens and the keyboard focus was in the list, which is hidden then, or fell
  to the page, that container takes the focus. The next Tab goes to the first control of
  the view. The same happens when one record page replaces another and its focused
  control is gone.
- Back on the list, the control in the list that had the focus last gets it back: the
  Edit, View, New or Import that opened the view, or the grid's rows after a double
  click. If it is gone or disabled (with `disableBackgroundGrid` the list is mounted anew),
  the list's container, `gridWrapper`, takes the focus.
- A container that takes the focus has `tabindex="-1"` for as long as it keeps it, and no
  outline: no focus ring shows, it never becomes a tab stop, and a click into it leaves the
  focus where the browser puts it without the container.
- The focus stays where it is when it rests outside the CRUD (e.g. on a button that calls
  the ref's `openView` or `showOverview`), when the new view focused a control itself
  (`autoFocus`), and when a `HistoryRouter` moved it to the new page's heading after a
  routed view switch. Nothing moves on the CRUD's first render, e.g. a CRUD with
  `initialView` in a dialog, whose focus the dialog handles.

## Why

Opening a view hid the focused Edit, New or Import together with the list, and leaving a
view removed the focused Back: the keyboard focus fell to the page. After Back the next Tab
left the CRUD past the whole list, and only Shift+Tab got back to it (WCAG 2.4.3 Focus
Order).

## Migration

Nothing required in app code. What to expect:

- Styles that reach the record page's form or the importer as a direct child of the
  CRUD's parent (e.g. `> form`) now match the `view` container: style the page's own
  element, or the container through `components.CcCrud.styleOverrides.view`.
- Browser tests that check where the focus is after opening a record or going back find
  it on the view's container or on the control that opened the view, instead of on
  `<body>`.
- Apps that moved the focus after a view switch themselves can drop that code. A record
  page that focuses a field with `autoFocus` keeps doing so.
