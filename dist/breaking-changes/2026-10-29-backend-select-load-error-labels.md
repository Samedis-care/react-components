# Backend selectors label a selected record that fails to load with a translated text

- **Date:** 2026-10-29
- **Kind:** behavior
- **Scope:** `backend-components/Selector` (`BackendSingleSelect`, `BackendMultiSelect`,
  `BackendMultipleSelect`, `BackendMultiSelectWithTags`)

## What changed

When a selected record failed to load and the owner passed no `onLoadError`, its entry was
labelled with the error's message, e.g. `[Components-Care] [RequestBatching] Requested
record not returned by backend: [...]`. The translated "Error while fetching data" meant
as the fallback was never reached. Now the entry is labelled:

- "Unknown entry" if the backend did not return the record: a batched load that did not
  return it, or an unbatched one answered with 404.
- "Error while fetching data" for any other error.

The error goes to the console instead (`console.warn`), with the entry's id. An
`onLoadError` still labels or drops the entry as before.

New translation key: `backend-components.selector.unknown-entry`.

## Why

A reference to a record that has since been deleted, or one the user may not see, showed
technical text in the form.

## Migration

None needed. An app that wants a different label, or the error's message, passes
`onLoadError`.
