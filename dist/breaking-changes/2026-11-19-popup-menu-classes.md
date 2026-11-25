# PopupMenu applies its `classes`

- **Date:** 2026-11-19
- **Kind:** behavior, theme
- **Scope:** `standalone/PopupMenu`

## What changed

`PopupMenu` puts the class names of its `classes` prop on the menu's elements, as MUI's
`Menu` does: `root` on the menu's root, `paper` on its paper and `list` on its list. A
theme's `components.CcPopupMenu.defaultProps.classes` apply the same way. Both were
ignored before.

As on MUI's `Menu`, `classes` replace the theme's default classes rather than adding to
them: when a `PopupMenu` gets `classes` (from its props or from
`components.CcPopupMenu.defaultProps`), `components.MuiMenu.defaultProps.classes` no longer
apply to it.

## Why

`PopupMenu` takes MUI's `MenuProps`, but a class name passed to style its paper or list
never reached them, so a `PopupMenu` could not be styled the way a MUI `Menu` is.

## Migration

Nothing to do for code that passes no `classes` to a `PopupMenu` and a theme without
`components.CcPopupMenu.defaultProps.classes`.

Where they are set, they take effect now: check those menus. If the theme also sets
`components.MuiMenu.defaultProps.classes`, add the keys those menus still need to the
`classes` they get:

```tsx
<PopupMenu classes={{ list: "my-list", paper: "the-theme-paper-class" }} />
```
