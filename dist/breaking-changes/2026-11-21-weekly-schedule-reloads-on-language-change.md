# WeeklySchedule reloads the shown week when the language changes

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `standalone/Schedule`

## What changed

When the language of `ComponentsCareI18n` changes, WeeklySchedule calls `loadData` again
for the shown week, with the same week offset and filter values, and shows the new
result. The spinner replaces the week until it arrives, as when the user moves to
another week. Until now a language change only cleared the week: the spinner stayed
until the user moved to another week or `loadData` changed.

## Why

After switching between two languages that start the week on the same day (de, fr, nl),
the dashboard calendar kept spinning. Entries whose texts the app or its backend
translates (e.g. texts a backend picks by the request's `Accept-Language`) now follow the
language.

## Migration

Nothing to do. `loadData` is called once more per language change. An app whose
`loadData` also changes with the language (e.g. when moment's first day of the week does)
may get two calls for one change; only the result of the latest one is shown.
