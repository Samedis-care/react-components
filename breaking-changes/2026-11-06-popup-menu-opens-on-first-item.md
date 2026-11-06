# A keepMounted PopupMenu opens on its first item every time

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/PopupMenu`, `standalone/DataGrid`

## What changed

Every open of a `PopupMenu` puts focus where MUI puts it on a menu's first open: on the
selected item with the default variant `selectedMenu`, else on the first enabled item.
With `keepMounted`, a reopened menu used to start on the item that had focus when it
closed: the one the user had arrowed to before Escape, or the one they activated.

The items of a `keepMounted` menu are not remounted, so they keep their state between
opens (the DataGrid's export entries keep a running or finished export).

In the library this changes the four DataGrid menus, which are all `keepMounted`: the
header's reset and export menus, the "more options" menu in the header on phones, and the
footer's "more" menu on phones.

## Why

MUI's `MenuList` remembers the item that had focus for as long as it stays mounted. A
keyboard user who reopened the DataGrid's reset menu after "Reset all" landed on "Reset
all", and Enter repeated it instead of refreshing; a screen reader announced the menu from
the middle of the list. The WAI-ARIA menu button pattern opens a menu on its first item.

## Migration

Nothing to do.
