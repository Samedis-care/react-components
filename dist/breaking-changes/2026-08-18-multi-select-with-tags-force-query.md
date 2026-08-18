# MultiSelectWithTags now honors forceQuery

- **Date:** 2026-08-18
- **Kind:** behavior
- **Scope:** `standalone/Selector`, `backend-components/Selector`

## What changed

`MultiSelectWithTags` accepted `forceQuery` and `startTypingToSearchText` in its prop
type (inherited via `MultiSelectWithoutGroupProps`) but never forwarded them — the
component enumerates the props it passes to its two inner selectors instead of
spreading them, and these two were missing from that list. They were dead props.

Both are now forwarded to the group `SingleSelect` **and** the data selector.

This also affects `BackendMultiSelectWithTags` and `CrudMultiSelectWithGroups`, which
inherit the prop.

## Why

The prop was in the public type and silently did nothing, which is worse than not
offering it. It also blocked setting `forceQuery` as a theme default for the WithTags
family, since the theme slot would have accepted a prop with no effect.

## Migration

If you set `forceQuery` on `MultiSelectWithTags`, `BackendMultiSelectWithTags` or
`CrudMultiSelectWithGroups` and relied — knowingly or not — on it being ignored, both
of its selectors will now stay empty until the user types. Remove the prop, or set
`forceQuery={false}` explicitly, to keep the old behavior.
