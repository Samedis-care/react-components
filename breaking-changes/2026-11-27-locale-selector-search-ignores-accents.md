# The locale selector's search ignores accents, apostrophe variants and blanks around the query

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `non-standalone/LocaleSelector` (LocaleSelectorDialog)

## What changed

The search box compares the query and the names as MUI's Autocomplete filters its options by
default: in lower case and without the accents of Latin, Greek and Cyrillic letters.
"osterreich" finds "Österreich", "francais" finds "français", "espanol" finds "español". In
addition, blanks around the query are ignored ("austria " finds Austria), a run of blanks
inside it counts as one, and every apostrophe-like character (’ ‘ ʻ ʼ ` ´ and others) reads as
the keyboard's `'`, so "o'zbek" finds "o‘zbek" and "Oʻzbekiston". Letters of their own, such as
ß, ø, æ and ı, still only match themselves, and names in other scripts compare as before.

## Why

The search compared the lower-cased query with `includes` and nothing else: a name was only
found when typed with its exact accents and apostrophe, and a trailing blank from autocomplete
or a paste hid every row.

## Migration

Nothing to do. A query now finds more rows than before; a test that expects an unaccented or
padded query to find nothing in the dialog has to change.
