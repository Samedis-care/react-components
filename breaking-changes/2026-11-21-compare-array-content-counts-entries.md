# compareArrayContent counts falsy entries and duplicates

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `utils/compareArrayContent`

## What changed

`compareArrayContent(arr1, arr2)` returns `true` only when `arr2` is a reordering of
`arr1`. Each entry must occur as often in one array as in the other, and entries compare
by identity (SameValueZero, like `Array.prototype.includes`). Its result changed in
three cases:

- Falsy entries (`""`, `0`, `null`, `undefined`, `false`) count like any other entry.
  `compareArrayContent([""], [""])` and `compareArrayContent([0, "a"], ["a", 0])` are now
  `true`; before, they were `false`.
- `NaN` equals `NaN`: `compareArrayContent([NaN], [NaN])` is now `true`.
- Duplicates must match: `compareArrayContent(["a", "a", "b"], ["a", "b", "b"])` is now
  `false`; before, it was `true`.

Arrays without falsy entries, `NaN` or duplicates compare as before.

## Why

The helper is documented to compare whether two arrays hold the same elements in a
different order. It treated an array that holds `""` or `0` as different from itself,
and it treated arrays with different duplicates as equal.

## Migration

Nothing to do for SCF, IMF and the HLth-care frontend: none of them calls
`compareArrayContent`. Code that does call it gets the results above, so a
selection that contains `""` or `0` now compares equal to itself.
