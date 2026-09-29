# useLocalStorageState follows what localStorage holds

- **Date:** 2026-09-29
- **Kind:** behavior
- **Scope:** `utils` (`useLocalStorageState`), and the selectors' LRU (`lru` of
  `BaseSelector` and everything built on it)

## What changed

- The state of `useLocalStorageState` is what localStorage holds under its key, not a copy
  each component keeps:
  - A change made in another browser tab shows in every tab using the key, e.g. a selector's
    LRU entries.
  - A functional update gets the stored value. It used to get the component's copy, so it
    wrote back values that had since been changed elsewhere.
  - When `storageKey` changes, the state is that key's value. It used to keep the value of the
    first key.
- New `setLocalStorageState(storageKey, defaultValue, validateData, update)` sets the value from
  outside the components using it. The mounted ones show it at once.
- New `updateSelectorLru(storageKey, update)` updates a selector's LRU entries that way, e.g.
  to replace an ID that changed.

## Why

A mounted component kept its own copy of the value and wrote it back on its next update. A
change made anywhere else was lost: in another tab, or by the app, for example when it
replaces a record's temporary ID with the server's ID in a selector's LRU.

## Migration

- State that should stay separate per tab can't use `useLocalStorageState` any more: keep it in
  React state, or give each tab its own key.
- App code that writes such a key with `localStorage.setItem` switches to
  `setLocalStorageState`, or `updateSelectorLru` for an LRU. A direct write only shows once
  the components render again.
