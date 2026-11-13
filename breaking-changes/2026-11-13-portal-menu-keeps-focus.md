# The Portal menu keeps keyboard focus when the focused entry is removed

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/Portal/Menu` (MenuBase, also used by RoutedMenu)

## What changed

- When the focused entry is removed from the menu, keyboard focus moves to the
  highlighted entry. An entry is removed when the definition changes (e.g. an app shows a
  different menu after a navigation) or its `shouldRender` turns false. If the
  highlighted entry cannot take focus (none is highlighted, or it is inside a collapsed
  group), focus goes to the first focusable element of the menu, and when the menu has
  none left, to the menu's root element.
- In RoutedMenu the highlight of the new location is set one render after the
  navigation. Focus follows it there, as long as it is still where it was moved.
- Focus that is elsewhere when the entry is removed (in the page, or on the page body
  because the user clicked outside the menu) stays where it is.
- The menu's root element (theme slot `CcPortalMenu` `root`) has `tabindex="-1"`. A
  click on an empty part of the menu now focuses the menu instead of the page body.
- `MenuItemProps` has a new optional prop, `focusRef`: a ref callback for the element of
  the entry that takes focus. MenuBase passes it to every `menuItem` renderer, and
  `MaterialMenuItem`, `JumboReactLightMenuItem` and `JumboReactDarkMenuItem` put it on
  their entry. A renderer that does not use it still works.

## Why

The focus fell to the page body, so the keyboard position was lost: in Chromium the next
Tab started over at the first menu entry, and screen readers in browse mode typically
restarted at the top of the document. This happened, for example, when "Back" in a menu
that the app swaps by path led to a page whose menu has no "Back" entry.

## Migration

Nothing to do for the built-in renderers. A custom `menuItem` renderer puts `focusRef`
on its focusable element, the one that gets `onClick`, so that focus can go to the
highlighted entry:

```tsx
const MyMenuItem = (props: MenuItemProps) => (
	<ListItemButton ref={props.focusRef} onClick={props.onClick}>
		{props.title}
	</ListItemButton>
);
```

Without it, focus goes to the first focusable element of the menu instead.
