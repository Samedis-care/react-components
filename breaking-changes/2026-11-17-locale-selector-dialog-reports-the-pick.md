# LocaleSelectorDialog reports the picked locale and stays open while it loads

- **Date:** 2026-11-17
- **Kind:** behavior, type
- **Scope:** `non-standalone/LocaleSelector`

## What changed

- **Ignored while the picked language loads:** after a row is picked, the close button,
  Escape and a backdrop click do nothing until the language is applied. The dialog then
  closes, or, when the language fails to load, shows the error dialog and stays open for
  another pick. They used to close the dialog at once, and the switch completed in the
  background.
- **New prop `onChange(locale)`:** called with the picked locale (`"<lang>-<COUNTRY>"`,
  e.g. `"de-AT"`) once `ComponentsCareI18n` has applied it, right before the dialog closes
  and calls `onClose`; also when the current locale is picked again. Not called when the
  dialog is dismissed or the language fails to load.
- **New helper `showLocaleSelectorDialog(pushDialog, props)`**, exported from the package
  root: it pushes the dialog and returns a `DialogPromise<string | null>` that resolves to
  the picked locale once it is applied, or to `null` when the dialog is dismissed (close
  button, Escape, backdrop, or the promise's `close()`). It never rejects.
- **`LocaleSelectorDialogContent`** (deep path only, the dialog's search box and list)
  no longer switches the language itself: its `close` prop is replaced by
  `handleSwitch(locale)` and `switching`, and the dialog switches the language, shows the
  error and closes.

## Why

A dismissal while the language loaded hid a change that still happened, so a caller
could not know whether the language changed. `ComponentsCareI18n`'s `languageChanged`
event also fires at start-up and for every other `changeLanguage` call, so it could not
tell a pick in the dialog, e.g. to save it to the user's profile.

## Migration

Nothing to do for SCF and IMF: they push the dialog without handlers, and neither renders
`LocaleSelectorDialogContent`.

To react to a pick in the dialog (e.g. save it to the user's profile), await the helper
instead of listening to `languageChanged`:

```ts
const locale = await showLocaleSelectorDialog(pushDialog, {
	supportedLocales: ["de", "en"],
});
if (locale) await saveUserLanguage(locale);
```

Code that renders `LocaleSelectorDialogContent` directly: render `LocaleSelectorDialog`
instead.
