# Portal menu entries and the burger tell screen readers their state

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Portal/Menu` (MenuBase, also used by RoutedMenu), the
  built-in menu entry renderers, `standalone/Portal/Layout` (the burger button)

## What changed

- A group entry has `aria-expanded="true"` or `"false"`, so screen readers say whether
  it is open and announce the change when it is toggled.
- The highlighted entry has `aria-current="page"`, so screen readers say which entry is
  the current page. Other entries have no `aria-current`.
- `MenuItemProps` has a new optional prop, `ariaAttributes`: the entry's state as ARIA
  attributes (`{ "aria-expanded": true | false }` for a group,
  `{ "aria-current": "page" }` for the highlighted entry, `{}` otherwise). MenuBase
  passes it to every `menuItem` renderer, and `MaterialMenuItem`,
  `JumboReactLightMenuItem` and `JumboReactDarkMenuItem` spread it on their entry.
- PortalLayout's burger button ("Toggle menu") has `aria-expanded`, `"true"` while the
  mobile drawer is open.

## Why

The expanded and highlighted state was shown only visually (a chevron, a highlight), so
a screen reader user could not tell whether a group was open, heard nothing when new
entries appeared after Enter, and could not tell which entry was the current page. The
same was true for the burger and the drawer.

## Migration

Nothing to do for the built-in renderers.

Required for a custom `menuItem` renderer: spread `ariaAttributes` on the element that
takes keyboard focus, the one that gets `onClick` and `focusRef`. Without it, screen
readers are not told which group is open or which entry is the current page.

```tsx
const MyMenuItem = (props: MenuItemProps) => (
	<ListItemButton
		ref={props.focusRef}
		onClick={props.onClick}
		{...props.ariaAttributes}
	>
		{props.title}
	</ListItemButton>
);
```
