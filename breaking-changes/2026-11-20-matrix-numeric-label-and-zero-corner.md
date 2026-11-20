# A numeric Matrix label is sized like its digits, and a corner of 0 is drawn

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Matrix`

## What changed

- A `MatrixTileItem.label` or `secondaryLabel` that is a number is sized like the string of
  its digits: `1234` is drawn at 10px like `"1234"`, `123` at 12px like `"123"`. A numeric
  label used to be drawn at the largest size (14px) whatever its length, a numeric
  `secondaryLabel` at the label's size. Labels in a diagonal pair keep their one size.
- A corner in `MatrixTileItem.corners` that is `0` is drawn, as a `label`, `secondaryLabel`
  or `placeholder` of `0` already was. It used to be left out.
- A corner of `true` draws no corner element any more (it drew an empty one). `null`,
  `undefined`, `false` and `""` draw none, as before.

## Why

A count or a room number held as a number was drawn at 14px, so with three or more digits
it overflowed its entry and was cut off, while the same digits as a string fit. A counter in
a corner disappeared at 0, so 0 could not be told from no counter at all.

## Migration

**Required for apps that pass a number as a corner and want that corner empty at 0** (a
counter that is shown only while it is above 0). Such a corner now shows "0". Pass `null`
for 0:

```tsx
const corners = { topRight: openRequests > 0 ? openRequests : null };
```

Nothing to do for numeric labels; expect labels of three or more digits to be drawn smaller.
