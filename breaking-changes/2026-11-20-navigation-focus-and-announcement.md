# After a navigation the focus moves to the new page's heading, and the new page is announced

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Routes` (`HistoryRouter`), `non-standalone/PageTitle`

## What changed

After a push or back/forward navigation, `HistoryRouter` (also the one `Framework`
renders) keeps the keyboard focus and screen readers with the new page. A `replace`
navigation and a navigation made while the router mounts (a redirect) are left alone.

- **The focus moves to the new page's heading** when it was on no element (the focused
  link or button was part of the content the navigation replaced, or got hidden) or on
  an element outside the viewport (the navigation scrolled the window to the top, e.g.
  a "Next" link at the bottom of a long record page). The heading is the `PageTitle` of
  the deepest route; without a `PageTitle`, the first `<h1>` inside `<main>` (or
  `role="main"`). A `PageTitle` that renders later, on a lazy route or a record that is
  still loading, gets the focus when it appears, unless the user clicked, typed or
  scrolled meanwhile. The heading gets `tabindex="-1"`, which makes it focusable
  without adding it to the tab order. After a keyboard navigation the browser draws its
  focus ring around the heading; after a mouse click it doesn't.
- **The focus stays** when it rests on an element in view (a menu link, a tab, a button
  outside the replaced content), and the new page title (the one `PageTitle` or
  `usePageTitle` sets) is announced in a polite live region, if it differs from the
  title before the navigation.
- `HistoryRouter` renders that live region after its children: a visually hidden
  `<div aria-live="polite" aria-atomic="true">`, fixed to the top left corner of the
  viewport, so it takes no space and never widens the page.

A `PageTitle` with `disableAutoTitle`, or inside a `FullFormDialog`, is not a focus
target.

## Why

Following a link inside the page content left the focus on `<body>`: the keyboard
position was lost, and a screen reader said nothing about the new page. A link that
stayed mounted kept the focus also when the navigation scrolled it out of view, so the
next Tab jumped back down the page, and the content changed elsewhere unannounced
(WCAG 2.4.3 Focus Order, 4.1.3 Status Messages).

## Migration

Nothing required. What to expect:

- Pages whose title is a `PageTitle` get the focus and the announcement without further
  work. A page without a visible heading names itself with `usePageTitle`: its title is
  announced, but the focus has no heading to go to and stays where the browser left it.
- Screenshots or visual tests taken after a keyboard navigation show a focus ring around
  the page heading.
- Browser tests that check where the focus is after a navigation may find it on the
  page heading now.
