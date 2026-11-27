# A CRUD serves its importer only where the app enables it

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `backend-components/CRUD`

## What changed

CRUD reserves two views for its importer: `import`, which the grid's Import opens, and
`devimport`, the unguided importer. Routed they are `<url>/import` and `<url>/devimport`;
with `disableRouting` they are the views `"import"` and `"devimport"` (`openView`,
`initialView`, the record page's `open`).

Before, both views existed on every CRUD: `enableUserImport` only showed the grid's Import.
Any user with the import permission could open the importer by typing its URL, and on a
CRUD without `importConfig` both URLs showed the unguided importer.

Now each view exists only where the app enables it:

| View        | Exists with                                 | Otherwise                                     |
| ----------- | ------------------------------------------- | --------------------------------------------- |
| `import`    | `enableUserImport`                          | `forbiddenPage`, or nothing if none is passed |
| `devimport` | `enableDevImport` (new, `false` by default) | `forbiddenPage`, or nothing if none is passed |

An enabled view still needs the import permission (`newPermission`, plus `editPermission`
when `importUpdateKey` is set). With `disableRouting`, a user without it now gets
`forbiddenPage` as well, as a routed CRUD already did; without `forbiddenPage` the importer
shows, as before.

The two ids stay reserved: on a CRUD without import, `<url>/import` does not open a record
with the id `import`.

## Why

The importer creates or updates records in bulk, so a CRUD whose app leaves import off
should not offer it by URL. The unguided importer's Connect data step runs the JavaScript
the user types for each field: a tool for developers working out an `importConfig`, not for
end users.

## Migration

- Nothing to do for a CRUD that sets `enableUserImport` and opens the importer through the
  grid's Import or `open("import")` / `openView("import")`.
- Required for any app that opens `devimport` on a CRUD (a link to `<url>/devimport`,
  `open("devimport")`, `openView("devimport")`, `initialView="devimport"`, or developers
  who type the URL): pass `enableDevImport` to that CRUD, or `devimport` shows
  `forbiddenPage`. Keep it out of production builds, for example:

  ```tsx
  <CRUD {...props} enableDevImport={process.env.NODE_ENV === "development"} />
  ```

- Required for any app that opens `import` on a CRUD without `enableUserImport` (a link to
  `<url>/import`, `open("import")`, `openView("import")`, `initialView="import"`): set
  `enableUserImport` on that CRUD, which also shows the grid's Import, or `import` shows
  `forbiddenPage`.
