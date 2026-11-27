# InfiniteScroll loads more on top when focus reaches its first row

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/InfiniteScroll` (and so `Notifications` and `ScrollableSchedule`)

## What changed

`loadMoreTop` is also called when focus moves to the first row the keyboard reaches in the
list: an element in the scroll container before which the container has no tab stop. This
happens however far the list is from its top, e.g. when a heading or the empty days at the
start of a schedule week come before the first row's button. In a widget that moves focus
with the arrow keys (a menu, listbox or grid whose items have a negative `tabIndex`), only its
first item counts. Focus on the scroll container itself does not count. This is what focus on
the last row already does for `loadMoreBottom`.

Any focus counts: Shift+Tab from below, Tab into the list from above (through the scroll
container), a click on the first row's button, or `focus()`. The call is debounced by
`callBackDebounce` like the others, is dropped if focus has moved on and the list is not at
its top when the wait is over, and waits while `loading` is set.

`ScrollableSchedule` loads the previous week when the first entry of its first loaded week
gets focus. `Notifications` calls `loadUnread` when the first focusable element in its list
gets focus.

## Why

Loading on top depended on the list being scrolled to its very top. A browser scrolls a
focused row into view, not to the top, so when content without focusable elements came before
the first row, Shift+Tab to that row loaded nothing and the next Shift+Tab left the list.
Keyboard users got the earlier rows only with Home, Page Up or the arrow keys, and nothing told
them to press those.

## Migration

Nothing required. Expect a `loadMoreTop` call when the first focusable row of a list gets
focus, also by Tab into the list or a click: tests that count these calls may need updating.
