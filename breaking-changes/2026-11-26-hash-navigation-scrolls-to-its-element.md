# A navigation to a hash scrolls to the element with that id and focuses it

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/Routes` (`HistoryRouter`, `Link`, `useNavigate`, `useResetScrollOnNavigation`)

## What changed

A push or replace of a HistoryRouter's history (`Link`, `useNavigate`, or `history.push` and
`history.replace` called directly) to a location with a hash (`"#details"`,
`"/devices/5#notes"`, `{ hash: "notes" }`) now works like a link to a fragment in a browser:

- Once the location has rendered, the element whose id is the hash (as written or
  percent-decoded) is scrolled into view: the window and every scroll container around it,
  PortalLayout's main pane included (`scrollIntoView({ block: "start", inline: "nearest" })`,
  so a `scroll-margin-top` on the element, e.g. below a sticky header, applies).
- The keyboard focus moves to that element, so the next Tab goes on after it. An element that
  cannot take the focus by itself (a `section`, a heading) gets `tabindex="-1"`, which makes it
  focusable without adding it to the tab order. The router's focus handling then leaves the
  focus there instead of moving it to the page heading.
- When the hash is all the navigation changes (the same pathname and search), the window and
  the scroll containers are no longer scrolled to the top. A hash that names no element leaves
  the page where it is; `"#top"` scrolls to the top when no element has the id `top`.
- A navigation to another page scrolls to the top as before, then to the element once the new
  page has rendered it. An element that renders later (a lazy route, a record that is still
  loading) is not scrolled to.
- A navigation with `preventScrollReset` scrolls to no element and leaves the focus where it
  is, as it leaves the scroll positions.
- Back/forward navigations are unchanged.

## Why

A link to an anchor of the page, such as a skip link (`<Link to="#main">`), scrolled the page to
the top and left the focus on the link, so it never reached its target (WCAG 2.4.1 Bypass
Blocks, 2.4.3 Focus Order). A link further down the page even scrolled away from it.

## Migration

Nothing required. Skip links and tables of contents can now use `Link` with `to="#<id>"`.

A navigation that keeps data in the hash on the same page (moving parameters into it with
`replace`, say) no longer scrolls to the top, and one whose hash is the id of an element now
scrolls to that element and focuses it; pass `preventScrollReset` where that is not wanted.

Tests: a test that expects `window.scrollTo(0, 0)` after a navigation that changes only the
hash needs updating. jsdom has no `Element.prototype.scrollIntoView`: a jsdom test that
navigates to a hash whose element exists needs a stub of it.
