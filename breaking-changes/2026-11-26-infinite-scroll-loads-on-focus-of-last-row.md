# InfiniteScroll loads more when focus reaches its last row

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/InfiniteScroll` (and so `Notifications` and `ScrollableSchedule`)

## What changed

`loadMoreBottom` is also called when focus moves to the last row the keyboard reaches in the
list: an element in the scroll container after which the container has no tab stop. This
happens however much content is left below the visible part, e.g. a loader row, a footer or
the empty days at the end of a schedule week after the last row's button, and also with
`threshold={0}`. In a widget that moves focus with the arrow keys (a menu, listbox or grid
whose items have a negative `tabIndex`), only its last item counts. Focus on the scroll
container itself does not count.

Any focus counts: Tab, Shift+Tab into the list from below, a click on the last row's button,
or `focus()`. The call is debounced by `callBackDebounce` like the others, is dropped if focus
has moved on when the wait is over, and waits while `loading` is set.

`ScrollableSchedule` loads the next week when its last entry gets focus, also when the loaded
weeks end with weeks without entries.

## Why

Loading depended on the list being scrolled to within `threshold` of its bottom. A browser
scrolls a focused row into view, not to the bottom, so when more content without focusable
elements than that followed the last focusable row, tabbing to that row loaded nothing and
the next Tab left the list. Keyboard users got more rows only with End, Page Down or the arrow
keys, and nothing told them to press those.

## Migration

Nothing required. Expect a `loadMoreBottom` call when the last focusable row of a list gets
focus, also by a click: tests that count these calls may need updating.
