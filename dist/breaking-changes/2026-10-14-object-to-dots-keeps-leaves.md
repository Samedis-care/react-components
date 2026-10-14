# objectToDots keeps null, arrays and empty objects as values

- **Date:** 2026-10-14
- **Kind:** behavior
- **Scope:** `utils/dotUtils` (`objectToDots`, `dotOmit`)

## What changed

`objectToDots` only flattens plain objects that have keys. Every other value is kept as it is
under its own key: `null`, arrays, empty objects and class instances such as `Date` or `Blob`.

It used to treat every value with `typeof value === "object"` as a nested object:

| Input           | Before                     | Now                  |
| --------------- | -------------------------- | -------------------- |
| `{ a: null }`   | `{}`                       | `{ a: null }`        |
| `{ a: {} }`     | `{}`                       | `{ a: {} }`          |
| `{ a: [1, 2] }` | `{ "a.0": 1, "a.1": 2 }`   | `{ a: [1, 2] }`      |
| `{ a: date }`   | `{}`                       | `{ a: date }`        |

`dotOmit` goes through `objectToDots`, so it now only removes the listed keys. Before, it also
dropped every `null`, `Date` and empty-object value, and returned arrays as objects with index
keys (`{ "0": 1, "1": 2 }`).

## Why

The keys disappeared without a trace, so the result no longer described the input. For
`dotOmit`, which documents that it copies the data minus the listed keys, this meant e.g. that
`dotOmit(readOnlyReasons, ["locked"])` came back empty when the remaining reasons were `null`.

## Migration

- Code that checks a `dotOmit` result for emptiness (`isObjectEmpty`) now also sees keys whose
  value is `null`. That is usually what was meant; check the call if `null` should count as
  "not set".
- Array elements can no longer be addressed by index: `objectToDots` returns the array under
  its key, and `dotOmit(data, ["list.0"])` leaves `list` unchanged. Omit the whole array key or
  filter the array instead.
