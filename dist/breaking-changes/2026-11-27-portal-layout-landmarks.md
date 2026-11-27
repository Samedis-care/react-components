# PortalLayout renders a main and a navigation landmark

- **Date:** 2026-11-27
- **Kind:** behavior, i18n
- **Scope:** `standalone/Portal/Layout` (PortalLayout)

## What changed

- `content` is rendered in a `<main>` element (the `main` slot of
  `CcPortalRenderLayout`, before a `div`), the page's main landmark. It has
  `tabindex="-1"`: `focus()` and a skip link (`<Link to={"#" + mainId}>`) move the focus to
  it, but it is not a stop of Tab. Once it has the focus, the arrow and page keys scroll it
  and Tab goes on to the first focusable element of the content. Focused from the keyboard,
  it shows a 2px focus ring in the theme's primary color inside its edge.
- `menuContent` is rendered in a `<nav>` named "Main menu" (new translation key
  `standalone.portal.main-menu`, in every locale), the page's navigation landmark: in the
  menu column on desktop, in the drawer in mobile view (also while the drawer is closed).
  It is the new `nav` slot of `CcPortalRenderLayout`, a flex column that fills the menu
  paper, so a menu with `height: 100%` fills the paper as before.
- `menuId` is set on that `<nav>`, no longer on the `div` of the menu column around the
  menu paper. In mobile view the element with `menuId` now holds the menu; before, it was
  empty. Without `menuContent` there is no `<nav>` and no element with `menuId`.

## Why

The layout exposed no landmark but the header's banner: screen-reader users could not jump
to the content or to the menu (WCAG 1.3.1 Info and Relationships, 2.4.1 Bypass Blocks).
The element with `mainId` could not take the focus, so moving the focus to the content,
e.g. after a client-side navigation, did nothing.

## Migration

Required for any app that wraps `content` in a `<main>` (or `role="main"`) or `menuContent`
in a `<nav>` (or `role="navigation"`) of its own: remove that wrapper. Otherwise the page
has a main landmark inside the main landmark, or a navigation inside the navigation.

```tsx
// before
<PortalLayout
	content={<main>{pages}</main>}
	menuContent={<nav aria-label={"Menu"}>{menu}</nav>}
	{...otherProps}
/>
// after
<PortalLayout content={pages} menuContent={menu} {...otherProps} />
```

Required for any app that reaches the menu column or the menu paper through `menuId`
(`#<menuId>` in CSS, `document.getElementById(menuId)`): the id is now on the `<nav>` inside
the paper. Style the paper through the `menuPaper` slot of `CcPortalLayoutMenu`, or go up
from the `<nav>` (`.closest(".MuiPaper-root")`).

A page in the main area that has nothing to Tab to and is longer than the pane is no longer
a stop of Tab by itself in browsers that make such a scroll container focusable (Chrome,
Firefox): `tabindex="-1"` takes it out of the Tab order. To scroll such a page from the
keyboard, focus the `<main>` (a skip link to `mainId` in the header, or `focus()` after the
navigation).

Tests: `getByRole("main")` and `getByRole("navigation")` now find the layout's landmarks; a
test that expects the menu paper inside the element with `menuId` needs updating.
