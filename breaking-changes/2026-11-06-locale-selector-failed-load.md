# LocaleSelectorDialog keeps the current language when the picked one fails to load

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `non-standalone/LocaleSelector`

## What changed

When the texts of the picked language cannot be loaded (offline, or the old chunks
return 404 after a deploy), `LocaleSelectorDialog` switches `ComponentsCareI18n` back to
the language it had before, shows an error dialog ("The language could not be loaded.
Check your internet connection, reload the page and try again.") and stays open. It used
to close without an error and leave the picked language applied, with every
Components-Care text in English and the picked language stored in
`localStorage.i18nextLng` for the next visit.

`ComponentsCareI18n`'s `languageChanged` event therefore fires twice in this case: first
with the picked language (i18next applies it before it reports the failed load), then
with the previous one.

## Why

i18next applies a language even when its texts failed to load, and it does not retry a
failed load until the page is reloaded, so the switch looked successful but showed
English.

## Migration

Nothing to do. A `languageChanged` listener that syncs the app's own i18next (as in the
`LocaleSelectorDialog` JSDoc) ends on the previous language, because it handles the
second event too. A listener with side effects, such as saving the language to the user's
profile, gets the previous language last.

The error text is the new key `non-standalone.language-switcher.load-error` in every
locale.
