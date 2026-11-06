# Menu entries call onAuxClick for the middle button only

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Portal/Menu` (MenuBase), `non-standalone/Portal/Menu` (RoutedMenu, `useRoutedMenuLogic`)

## What changed

A menu entry's `onAuxClick` is now called only when the entry is clicked with the middle
button (`event.button === 1`). Browsers fire `auxclick` for the right button too (and for
the back and forward buttons of some mice), and those used to call it as well.

- **MenuBase:** the `onAuxClick` it passes to its `menuItem` renderer ignores every button
  but the middle one, so a custom renderer that puts it on its element gets the same rule.
- **RoutedMenu and `useRoutedMenuLogic`:** a right click on an entry no longer opens its
  `route` in a new tab. A middle click still does, after calling the definition's own
  `onAuxClick`. This also holds for the definitions `useRoutedMenuLogic` returns when an
  app renders them with its own components.

## Why

`onAuxClick` is documented as the middle-click handler. RoutedMenu opened the page in a new
tab or window on every right click on an entry, on top of the browser's context menu (IMF's
admin menu; SCF's `SamedisMenu`, which renders `useRoutedMenuLogic`'s definitions).

## Migration

Nothing to do for IMF and SCF: neither sets an `onAuxClick` of its own on a menu entry, and
a middle click on their routed menus still opens the page in a new tab.

An `onAuxClick` in a menu definition that relied on the right, back or forward button no
longer sees them. Handle the right button with `onContextMenu` in a custom `menuItem`
renderer instead.
