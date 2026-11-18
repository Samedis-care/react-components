# LocaleSelectorDialog's supportedLocales match ignoring case, with _ read as -

- **Date:** 2026-11-17
- **Kind:** behavior, type
- **Scope:** `non-standalone/LocaleSelector`

## What changed

`supportedLocales` entries are compared ignoring case, and `_` reads as `-`: `"de-at"`,
`"de_AT"` and `"DE-AT"` all offer the row `de-AT`, and `"DE"` offers every German row. They
used to be compared exactly, so such entries matched nothing and were dropped. The prop
also takes a readonly array (`as const`): its type is `readonly string[]`.

## Why

Language tags are case-insensitive, i18next reads `de-de` as `de-DE`, and `_` is the POSIX
spelling that `getCurrentLocale` already reads as `-`. Entries in these spellings were
silently ignored, and an app whose list matched nothing showed an empty dialog.

## Migration

Nothing to do for SCF (it passes lower-case languages) and IMF (it passes none). An app
whose `supportedLocales` holds entries in another case or with `_` now offers those rows.
