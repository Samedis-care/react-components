# PortalLayout keeps the menu mounted when it switches between desktop and mobile view

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Portal/Layout` (PortalLayout and its menu part, `CcPortalLayoutMenu`)

## What changed

`menuContent` stays mounted when the layout switches between the desktop menu column and
the mobile drawer (the window crosses `collapseBreakpoint`, or `collapseMenu` or
`mobileViewCondition` changes). Before, every switch unmounted and remounted it. Now
everything in it keeps its state: a `MenuBase`'s highlighted entry, the groups the user
expanded (in a `RoutedMenu` too), a `CollapsibleMenu`'s collapsed state, and the state of
the app's own components. Effects in `menuContent` no longer run again on the switch.

The menu is rendered into a wrapper that moves between the desktop column's Paper and the
drawer's paper. The paper's child is now a `div` with `display: contents`, with a second
one inside it that holds the menu (in mobile view also the drawer's top row). Neither
generates a box, so the layout is unchanged: percentage heights and flex items inside
`menuContent` still resolve against the paper. Only selectors and code that expect the
menu as a direct child of the paper (`.MuiDrawer-paper > …`, `paper.firstElementChild`)
no longer find it.

Escape pressed in the open drawer's menu still closes the drawer and is not passed on to
handlers above the layout, as before.

## Why

The desktop column and the mobile drawer are different elements, so rendering the menu
into each remounted it at every switch. A user who expanded a group and picked an entry,
then rotated a tablet or narrowed the window, found the group collapsed and the entry no
longer highlighted; a collapsed CollapsibleMenu was expanded again when the layout
returned to desktop.

## Migration

- Required for apps that style or query the menu through a direct-child selector of the
  menu paper or the drawer's paper (`> `) or through `firstElementChild`: use a
  descendant selector or a class of the menu itself. IMF, SCF and hlth.care do not.
- Required for apps that relied on the switch to reset part of the menu: key that part on
  the layout's mode, from a component inside `menuContent`:

  ```tsx
  const ResettingMenu = () => {
  	const { mobile } = usePortalLayoutContext();
  	return <MyMenu key={mobile ? "mobile" : "desktop"} />;
  };
  ```

- Nothing to do otherwise.
