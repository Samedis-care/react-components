# InfiniteScroll is a function component, and a ref to it is the scroll container element

- **Date:** 2026-11-26
- **Kind:** type
- **Scope:** `standalone/InfiniteScroll`

## What changed

- `InfiniteScroll` is a function component (`React.memo` around `React.forwardRef`) instead
  of a class. It renders the same scroll container and behaves the same.
- A ref to it is the scroll container element (`HTMLDivElement`), `null` before mount and
  after unmount. It used to be the class instance, whose `wrapper` field held that element.
- `InfiniteScroll` is no longer a type: `useRef<InfiniteScroll>` and
  `React.RefObject<InfiniteScroll>` no longer compile, and the instance members (`wrapper`,
  `resizeObserver`, `handleResize`, `handleScroll`, `handleFocusIn`, `setScrollerRef`) are
  gone. The component cannot be subclassed.
- `InfiniteScrollProps` is also exported from the package root.

## Why

The library's components are memoized function components. A ref to a component is the
element it renders, as with MUI's components.

## Migration

- Required for any app that holds a ref to `InfiniteScroll` (or to a
  `styled(InfiniteScroll)`): type the ref as `HTMLDivElement` and use the element itself
  where it used its `wrapper` field. TypeScript reports both places.

  ```tsx
  // before
  const list = useRef<InfiniteScroll | null>(null);
  list.current?.wrapper?.focus();
  // after
  const list = useRef<HTMLDivElement | null>(null);
  list.current?.focus();
  ```

- Otherwise nothing to do.
