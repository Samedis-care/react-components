# A collapsed CollapsibleMenu is shown in the mobile layout

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Portal/CollapsibleMenu`

## What changed

In the mobile layout of PortalLayout (below `collapseBreakpoint`, with `collapseMenu` or
while `mobileViewCondition` matches) a CollapsibleMenu always shows its menu, also when
the user collapsed it on desktop. When the layout returns to desktop, the menu is
collapsed again and "Expand menu" shows it.

## Why

The mobile layout renders no collapse button. A CollapsibleMenu that the layout switch
does not remount (e.g. one in `content`) stayed hidden after the switch, with no button to
expand it, so its menu could not be reached until the window was wide again.

## Migration

Nothing to do. No app (SCF, IMF, hlth.care) renders a CollapsibleMenu.
