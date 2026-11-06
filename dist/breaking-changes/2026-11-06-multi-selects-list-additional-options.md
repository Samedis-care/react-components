# The backend multi selects list additionalOptions ids from their entries

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `backend-components/Selector` (`BackendMultiSelect`, `BackendMultipleSelect`,
  `useSelectedCache`, and so also `CrudMultiSelect`)

## What changed

`additionalOptions` only reached the list of options. A selected id that matched one of
them was still looked up in the backend like a record. The lookup failed, so the entry was
listed as "Unknown entry" (or with `onLoadError`'s text), and an `onLoadError` that drops
(`null`) removed the id from the selection when the field mounted, through `onSelect`,
without user action.

Now a selected id that matches an `additionalOptions` entry is listed from that entry, as
the single select already did: no request, never labelled as a load error, never dropped.
`useSelectedCache` takes `additionalOptions` for this.

## Why

Picking an additional option (e.g. "No department") worked within the session but broke
the next time the field mounted: the entry showed an error text, or the value lost it and
the form saved without it.

## Migration

Nothing to do.
