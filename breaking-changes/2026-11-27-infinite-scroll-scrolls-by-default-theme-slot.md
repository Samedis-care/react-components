# InfiniteScroll scrolls by default, and the theme styles it through `CcInfiniteScroll`

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/InfiniteScroll` (and so `Notifications` and `ScrollableSchedule`)

## What changed

- The scroll container is `overflow: auto` by default. It had no overflow of its own, so
  the `className` had to set it.
- `className` is optional. The container still needs a bounded height (`height`,
  `max-height`, or `flex: 1` inside a flex column of bounded height), which can come from
  `className`, `styled(InfiniteScroll)`, `sx`, `style` or the theme.
- `InfiniteScroll` takes `sx`.
- The theme styles it through `components.CcInfiniteScroll`: `defaultProps` (any of its
  props, e.g. `threshold` or `callBackDebounce` for every list), `styleOverrides.root` (the
  scroll container) and `variants`, which match the `div` props the container gets,
  `aria-busy` while `loading` included. `InfiniteScrollClassKey` is exported.

## Why

A theme can set InfiniteScroll's default props and styles, as it can for the library's
other components, and the scroll container scrolls without the caller saying so: a bounded
height is all it needs.

## Migration

- Required for any app that sets an `overflow` other than `auto` (e.g. `hidden`) on the
  scroll container through a class from a plain stylesheet or a CSS module: the default
  `overflow: auto` is an emotion style inserted later, and can win over it. Set it with
  `styled(InfiniteScroll)`, `sx` or `components.CcInfiniteScroll.styleOverrides.root`
  instead.

  ```tsx
  const List = styled(InfiniteScroll)({ height: 400, overflowY: "scroll" });
  ```

- Otherwise nothing to do. An app may drop `overflow: auto` from the container's styles,
  and a `className=""` passed only because the prop was required.
