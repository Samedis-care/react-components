# PortalLayout's mobile drawer has a close button for screen readers and keyboard users

- **Date:** 2026-11-24
- **Kind:** behavior
- **Scope:** `standalone/Portal/Layout` (PortalLayout)

## What changed

In mobile view (below `collapseBreakpoint`, with `collapseMenu` or while
`mobileViewCondition` matches) the menu drawer has a close button labelled "Close menu"
(`standalone.portal.close-menu`, in every locale).

It is visually hidden and takes no space, so a drawer opened with a pointer looks as
before. It is the drawer's first element: screen readers reach it before the menu
entries, and it is the first stop of Tab in the drawer, before `topLeft` in variant
`basic`. While it has keyboard focus it is shown at the top of the drawer, at its end
(on the right, on the left in a right-to-left layout), over the content: a 48px X with
the same focus ring as the burger button.

The button closes the drawer, and focus returns to the element that had it before the
drawer opened, usually the burger button, as with Escape and a click on the backdrop.

The button is the theme slot `closeMenuButton` of `CcPortalRenderLayout`. The desktop
menu is unchanged.

## Why

While the drawer is open, the rest of the page is hidden from assistive technology, and
the backdrop cannot be reached with a screen reader. Touch screen-reader users
(VoiceOver, TalkBack) have no Escape key, so they had no way back to the page.

## Migration

Nothing to do. A test that tabs through the open drawer, or counts the buttons in it,
meets the close button first.
