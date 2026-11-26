# A HistoryRouter inside another one leaves the page's scroll position and focus alone

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/Routes` (`HistoryRouter`, `useResetScrollOnNavigation`, `PageTitle`)

## What changed

A `HistoryRouter` rendered inside another one, e.g. a wizard on a `createMemoryHistory()`
inside a page under "/devices/*", now acts only within its own content when it navigates:

- A push or replace scrolls only the scroll containers registered with it
  (`useResetScrollOnNavigation` inside it) to the top, also for "#top". The window and the
  document stay where they are. Before, every step of the wizard scrolled the window to
  the top, away from the wizard.
- When its navigation leaves the keyboard focus on no element or out of view, the focus
  moves only to a `PageTitle` rendered inside it, e.g. one on a step of the wizard. Without
  one, the focus stays where it is. Before, it moved to the page's `PageTitle` or the
  first `<h1>` of `<main>`, at the top of the page, outside of the wizard.
- Its live region announces only a page title set inside it. Before, a step without a
  title announced the title of the page around the wizard.

The outermost `HistoryRouter` (the one `Framework` renders on `FrameworkHistory`) behaves
as before. Page titles set inside a nested `HistoryRouter` still name the document.

## Why

A nested `HistoryRouter` routes within a page: its navigations don't leave the page. The
user who moves through the wizard expects to stay at the wizard, with the focus on the
control they used.

## Migration

Nothing to do. A wizard whose step changes remove the focused control (a "Next" button
inside the step) can render a `PageTitle` on each step to get the focus there.
