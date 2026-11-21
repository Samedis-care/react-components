# The page scrolls to the top after a navigation, not before

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `standalone/Routes`

## What changed

- `HistoryRouter` (which `Framework` renders for `FrameworkHistory`) scrolls the
  window and the document to the top after each push and replace navigation, once the
  location has changed. Before, `useNavigate` (and `Link`, which uses it) did it
  before it called the history.
- A navigation that a blocker cancels keeps the scroll position, e.g. a link out of a
  form page with unsaved changes when the user chooses to stay. One that the blocker
  lets through later (the user leaves) scrolls to the top then.
- `FrameworkHistory.push()` / `replace()`, and `push()` / `replace()` of any history a
  `HistoryRouter` renders, now scroll to the top too when called directly, not only
  through `useNavigate`. Back/forward navigations still leave the scroll position to
  the browser, and other scroll containers keep theirs.

## Why

The reset ran before the navigation, so it also ran for navigations that never
happened: a user who had scrolled down a form with unsaved changes, clicked a link and
stayed in the "Leave form page?" prompt was taken back to the top of the page. Done by
the router once the location has changed, the reset belongs to the navigation itself,
however it was started.

## Migration

Nothing is required.

- Optional for SCF: `openLink` (`src/utils/openLink.ts`) copies the old reset
  (`resetScroll()`) before `FrameworkHistory.push` / `replace`. The router now does
  it after the navigation, so the copy can be removed; while it stays, an `openLink`
  navigation that the form guard cancels still scrolls to the top first. SCF's
  document doesn't scroll (`overflow: hidden`), so nothing visible changes either way.
- Unit tests (jsdom) that call `history.push` / `replace` directly while a
  `HistoryRouter` or `Framework` is rendered now reach `window.scrollTo`, which jsdom
  doesn't implement: it logs "Not implemented: Window's scrollTo() method" and the
  test goes on.
  Mock it as for `useNavigate`:
  `vi.spyOn(window, "scrollTo").mockImplementation(() => {})`.
