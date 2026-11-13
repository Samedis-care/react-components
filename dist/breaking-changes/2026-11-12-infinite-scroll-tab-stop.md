# InfiniteScroll's scroll container is a tab stop and takes the props of a div

- **Date:** 2026-11-12
- **Kind:** behavior
- **Scope:** `standalone/InfiniteScroll` (and so `Notifications` and `ScrollableSchedule`)

## What changed

- The scroll container has `tabIndex={0}` by default, so it is a tab stop. While it has
  keyboard focus it draws the library's focus ring: `2px solid palette.primary.main`, inset,
  on `:focus-visible` only, so it does not show on click. The new `tabIndex` prop overrides
  the default; `-1` takes the container out of the tab order.
- A click on a row that contains nothing focusable now focuses the scroll container. Before,
  focus went to the nearest focusable ancestor (the paper of a popover or dialog) or stayed
  where it was.
- `InfiniteScrollProps` extends `React.HTMLAttributes<HTMLDivElement>`, and every prop of a
  `div` that InfiniteScroll does not use itself reaches the scroll container: `role`,
  `aria-label`, `aria-labelledby`, `id`, `style`, event handlers. `aria-*` props used to
  type-check but were dropped; they now take effect.
- `Notifications` makes its list a region named by the popover's "Notifications" heading
  (`role="region"`, `aria-labelledby`).
- `ScrollableSchedule`'s scroll container is a tab stop too (it has no name yet).

## Why

Safari, and every browser on iOS and iPadOS, gives a scroll container no tab stop of its
own. When the rows contained nothing focusable (text-only notifications, schedule weeks
without entries), keyboard users could not reach the list, scroll it or load more. Inside a
popover or dialog, a click on a row moved focus to the paper, so End, Page Down and the
arrow keys scrolled the paper's scroll chain and the list stayed where it was. And the list
could not be given a role or a name, so the tab stop that Chromium adds on its own was
announced with the text of all its rows as its name.

## Migration

- Give every InfiniteScroll a role and a name, e.g. `role="region"` with `aria-labelledby`
  pointing at the list's visible heading, or a translated `aria-label`. `Notifications` does
  this already.
- Expect one extra tab stop per list, in front of focusable rows, and a focus ring on it.
  Tests that count Tab presses through a list, and visual baselines of a focused list,
  need updating. Pass `tabIndex={-1}` where a list must stay out of the tab order.
