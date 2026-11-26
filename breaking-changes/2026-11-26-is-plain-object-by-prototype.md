# isPlainObject tells a plain object by its prototype; a record with an entry named constructor counts

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `utils/isPlainObject`, and what reads records through it: `deepEqual`, `deepAssign`,
  `deepSort`, `objectToDots`, the request bodies of `RailsApiClient` and `JsonApiClient`, `Model`,
  and the persisted `DataGrid` state

## What changed

`isPlainObject(value)` is true for an object whose prototype is `Object.prototype` or `null`, and
false for every other value. It used to compare the object's `constructor` property with `Object`:

| Value                                   | Before  | Now     |
| --------------------------------------- | ------- | ------- |
| `{ constructor: 1, name: "x" }`         | `false` | `true`  |
| `Object.create(null)`                   | `false` | `true`  |
| `Object.create({ a: 1 })`               | `true`  | `false` |
| `{}`, the result of `JSON.parse`        | `true`  | `true`  |
| arrays, `Date`, `Blob`, class instances | `false` | `false` |

So a record with an entry named `constructor` (a field, a column or a key of its own) is a record
everywhere in the library:

- A data grid restores the stored sort, filters and column widths of a column named
  `constructor`, and of the columns next to such an entry. The whole sort record, filter record or
  width record used to be dropped.
- `deepEqual` compares such records key by key. It threw "Unsupported data type: object" for
  them, or, with `"ignore"`, took them as equal and, with `"equals"`, compared them by identity.
- `deepAssign` merges such a record into the target's record, `deepSort` sorts its keys and
  `objectToDots` flattens it. They used to take it as a single value.
- `JsonApiClient` and `RailsApiClient` find the files inside such a record of a request body: it
  is sent with its files as data URIs (JSON) or as multipart (Rails). A file in it used to be sent
  as `{}`.

## Why

A record's own entries are data. An entry named `constructor` shadowed the property the check
read, so the record counted as some other kind of object, and data stored under it was lost.

## Migration

Nothing to do for values that come from JSON or object literals. Code that passes an object
inheriting from another object (`Object.create(proto)`) and relied on it counting as a plain
object must copy it into a plain object first, e.g. `{ ...value }`.
