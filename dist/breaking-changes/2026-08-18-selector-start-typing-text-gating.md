# "Start typing to search" is gated on forceQuery, not on lru

- **Date:** 2026-08-18
- **Kind:** behavior
- **Scope:** `standalone/Selector`
- **Commit:** `b97926f0` — Selectors: forceQuery prop

## What changed

`BaseSelector` picked its empty-list message based on whether `lru` was configured:

```ts
// before
lru && query === "" ? startTypingToSearchText : noOptionsText;
// after
query === "" && (forceQuery || lru?.forceQuery)
	? startTypingToSearchText
	: noOptionsText;
```

The message is now chosen by whether a search query is actually required, rather than
by whether the LRU cache happens to be enabled.

## Why

`forceQuery` works without `lru`, but in that configuration the dropdown said
"No options" instead of "Enter a search string to get results" — which reads as
"nothing exists" rather than "type something", making the mode look broken.

## Migration

Two behavior changes, both making the message match reality:

- `forceQuery` **without** `lru`: an empty dropdown now shows
  `startTypingToSearchText` instead of `noOptionsText`.
- `lru` with `lru.forceQuery === false` and an empty LRU list: this configuration
  _does_ load the full list, so an empty result now correctly shows `noOptionsText`
  instead of `startTypingToSearchText`.

If you relied on the old strings, override `noOptionsText` /
`startTypingToSearchText` per instance.

## Related (not breaking)

The same commit fixed the type of `ComponentsPropsList["CcBaseSelector"]`. It was
declared as `Partial<BaseSelectorProps<BaseSelectorData, never>>`, and because
`BaseSelectorVariants<DataT, never>` distributes over `never`, the whole type
collapsed — any `CcBaseSelector.defaultProps` value failed with
`Type '{ ... }' is not assignable to type 'undefined'`. It is now
`Partial<BaseSelectorThemeProps>`. Nothing could have depended on the broken type, so
there is no migration.
