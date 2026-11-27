# A linked SignalPortlet row is a link

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/SignalPortlet` (`SignalPortletItem`'s rows with `link`)

## What changed

A row with `link` is a link: its ListItemButton renders the library's `Link`, an `<a>` with
the `link` as its href, named by its count and text ("5 Open Incidents, link"). It used to
be a `div` with role button whose click navigated.

- A click or Enter navigates in the app as before, through the HistoryRouter's history,
  its blockers and its scroll reset.
- A click with Ctrl, Meta, Shift or Alt is left to the browser, which opens the href in a
  new tab or window, and so is a middle click. Such a click used to navigate in the
  current tab; a middle click did nothing.
- Space no longer opens the row: a link is activated with Enter.
- A click on a row that links to the current location replaces the history entry instead
  of pushing a second one for it, as every `Link` does.
- A `link` with a scheme ("https://…") is a plain link that the browser follows. A click
  on it used to throw an Error.

The row looks the same. It keeps its class names (`rootBtn`, `MuiListItemButton-root`,
`Mui-focusVisible`) and its theme slot `CcSignalPortletItem.rootBtn`.

## Why

Activating a counter opens another page, which is what a link does. As a button, a counter
was announced as "5 Open Incidents, button" and missing from a screen reader's list of
links (WCAG 4.1.2, 1.3.1), and nobody could open it in a new tab, see its URL or copy it.

## Migration

- **Required for any app test or script that finds a counter by its role or element:**
  query it as a link, `getByRole("link", { name: "5 Open Incidents" })` instead of
  `getByRole("button", …)`, or as `a.MuiListItemButton-root` instead of
  `div.MuiListItemButton-root`.
- **Required for any app that passes a link, a button or another interactive element in an
  item's `text` together with a `link`:** move that element out of the item. A link cannot
  hold interactive content, and a click on it also opens the row's link.
- An app whose items pass plain text and paths of the app has nothing else to do.
