# An LRU with nothing to show no longer hides a selector's options

- **Date:** 2026-09-25
- **Kind:** behavior
- **Scope:** `standalone/Selector`, `backend-components/Selector`

## What changed

With `lru` in its default `"exclusive"` mode and an empty search query, a selector
showed only the LRU block as soon as the LRU cache held any id, even if none of
those ids produced an entry. The list then consisted of a lone "Last recently used"
label, and the data source's options stayed hidden until the user typed.

The LRU entries are now resolved first. If none of them can be shown (`loadData`
skipped them, they are `hidden`, or loading them failed), the selector loads the
data source as if there was no LRU. `lru.forceQuery` still suppresses the data
source on an empty query. The label is only rendered above at least one entry.

## Why

`SelectorLruOptions.loadData` may now return `undefined` to skip an id while keeping
it in the LRU cache, e.g. an id that belongs to a data set not loaded right now. A
backend error removes the id from the cache, so that case recovered on the next
load; a skipped id stays, and would have hidden the options for good.

## Migration

Nothing to change. Where no LRU entry can be shown, expect the full option list
instead of a bare "Last recently used" label.
