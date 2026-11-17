# ComponentsCareI18n leads the UI language: apps change the language through it

- **Date:** 2026-11-17
- **Kind:** API
- **Scope:** `i18n` (`ComponentsCareI18n`), `non-standalone/LocaleSelector`

## What changed

Components-Care's i18next instance, `ComponentsCareI18n`, is the leading instance of an
app's UI language, and the app's own i18next instance follows it. The library's code is
unchanged; its documentation (the JSDoc of `ComponentsCareI18n` and of
`LocaleSelectorDialog`) now states this contract:

- An app changes the UI language with `ComponentsCareI18n.changeLanguage(locale)`, never
  only with its own instance's `changeLanguage`.
- The app's own instance follows `ComponentsCareI18n` through one `languageChanged`
  listener at the app's entry point:

  ```ts
  // Components-Care i18n locale sync
  ComponentsCareI18n.on("languageChanged", () => {
  	void i18n.changeLanguage(getCurrentLocale(ComponentsCareI18n));
  });
  ```

  `languageChanged` also fires when the language is detected at start-up, so the listener
  covers the first language too.

## Why

The Components-Care widgets, moment's locale and `<html lang>` follow `ComponentsCareI18n`
only (the Framework's `CCI18nProvider` sets moment and `<html lang>` on its
`languageChanged`). A language set on the app's own instance alone reaches none of them:
they stay in the old language until the next page load, when Components-Care's language
detector reads the language the app's detector stored in `localStorage.i18nextLng`.

## Migration

Required for every app that calls `changeLanguage` on its own i18next instance anywhere
but in the sync listener: call `ComponentsCareI18n.changeLanguage` instead. Without it,
the Components-Care widgets, dates and `<html lang>` stay in the old language until the
page is reloaded.

- **samedis.care (SCF):** `src/pages/components/AuthProvider.tsx` sets the language of the
  user's profile after login on its own instance only:

  ```ts
  // before
  if (tokens.lang) i18n.changeLanguage(tokens.lang).catch(console.error);
  // after
  if (tokens.lang)
  	ComponentsCareI18n.changeLanguage(tokens.lang).catch(console.error);
  ```

  The listener in `src/index.tsx` then makes `i18n` follow.

- **IM (IMF):** nothing to change. `src/pages/Auth/components/LangSelector.tsx` already
  calls `ComponentsCareI18n.changeLanguage`, and `src/index.tsx` has the listener.

Required for every app: exactly one listener as above at the entry point, registered
before the app renders. SCF and IMF have one in `src/index.tsx`.

Not required: the listener doesn't need to call `moment.locale`. Inside the Framework,
`CCI18nProvider` loads moment's locale for the new language and sets it, together with
`<html lang>`.
