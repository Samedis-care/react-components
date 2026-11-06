# PortalLayout's mobile drawer leaves a strip of backdrop on narrow screens

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Portal/Layout` (PortalLayout)

## What changed

In mobile view (below `collapseBreakpoint`, with `collapseMenu` or while
`mobileViewCondition` matches) the menu drawer is never wider than the screen minus 56px.
A `drawerWidth` larger than that is capped, and without `drawerWidth` a long menu title
wraps instead of widening the drawer past that limit.

With `drawerWidth={320}` the drawer is now 264px wide on a 320px phone and 304px wide on a
360px phone. From a 376px wide screen up it keeps its full 320px. The desktop menu column
is unchanged.

## Why

A drawer as wide as the screen covered the whole page and the burger button, so there was
no backdrop left to tap to close it. Touch users without a keyboard were stuck in the menu.
Material's guidance for a modal navigation drawer is the same limit: at most the screen
width minus 56px.

## Migration

Nothing to do. On phones narrower than `drawerWidth` + 56px the drawer is narrower than
before, so its entries have less room: expect long titles to wrap in screenshots of the
mobile menu (IMF's admin UI on phones up to 375px wide).
