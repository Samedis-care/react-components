# RoutedMenu honors forceExpand on its entries

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `non-standalone/Portal/Menu` (RoutedMenu, `useRoutedMenuLogic`)

## What changed

`IRoutedMenuItemDefinition` accepted `forceExpand` (inherited from MenuBase's
`IMenuItemDefinition`), but RoutedMenu replaced it with its own value: a group was expanded
only while the entry of the current URL was inside it.

Now a group with `forceExpand: true` is expanded on every page, and RoutedMenu still expands
the groups above the entry of the current URL as before. As in MenuBase, a click on a group
that is expanded this way does not collapse it. `useRoutedMenuLogic` keeps the entry's
`forceExpand` in the definition it returns.

## Why

The flag was in the public type and documented by MenuBase, but silently had no effect in
RoutedMenu.

## Migration

An app that sets `forceExpand: true` on a routed group now sees that group expanded on every
page. Remove the flag to keep the old behavior.
