# TreeView's scrollTo waits until its entry is visible and the list is measured

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/Tree` (`TreeViewDispatch.scrollTo`)

## What changed

`ref.current.scrollTo(id)` used to act at once or never:

- Right after TreeView mounted, react-window had not measured the list yet. The row was
  aligned as if the list were 0px high, so it ended up just above the visible area, and a
  target among the first rows scrolled the tree past it.
- An id that was not in `data` yet, or whose entry was under a collapsed ancestor, was
  dropped. Nothing scrolled when the entry showed up later.

Now a request waits until the entry is visible (in `data` and not under a collapsed
ancestor) and the list has been measured with a height. A tree in a hidden panel
(`display: none`) therefore waits until the panel is shown. Then the row is scrolled into
view, once. A later `scrollTo` call replaces a request that is still waiting.

## Why

Revealing the selected entry when the tree appears, or once the entry's data has loaded,
missed the entry or did nothing.

## Migration

Nothing required. A caller that waits for the entry to be in `data`, or for a frame after
mount, before it calls `scrollTo` can call it right away instead.

A request for an entry that does not show up keeps waiting until the next `scrollTo` call
or until TreeView unmounts. If the entry appears later, for example when the user expands
its folder, the tree scrolls to it then.
