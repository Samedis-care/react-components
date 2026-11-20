# LocaleSelectorDialog requires supportedLocales

- **Date:** 2026-11-20
- **Kind:** behavior, type
- **Scope:** `non-standalone/LocaleSelector` (`LocaleSelectorDialog`, `showLocaleSelectorDialog`)

## What changed

`supportedLocales` is required on `LocaleSelectorDialog` and in the props of
`showLocaleSelectorDialog`: a dialog without it no longer compiles. Without it the dialog
used to offer every country of every language Components-Care ships (8 languages, 261
rows). A dialog that gets none at all at runtime (from JavaScript, or through a cast) now
offers nothing, as `[]` does.

The entries and how they match are unchanged. Pass it where the dialog is opened: a
theme's `components.CcLocaleSelectorDialog.defaultProps.supportedLocales` does not satisfy
the type.

## Why

Components-Care ships languages an app may not have translations for: it has ru, fr, de,
it, es, uz, en and nl, samedis.care and identity management have fr, ru, de, en and nl.
Picking such a language switched only the Components-Care widgets, while the app's own
texts fell back to English. The app's language detector then stored `en` in
`localStorage.i18nextLng`, which both i18next instances read, so after a reload everything
was English again and the pick was lost. Only the app knows which languages it can show.

## Migration

Required for every `LocaleSelectorDialog` and `showLocaleSelectorDialog` call without
`supportedLocales`; in identity-management-frontend that is
`src/pages/Account/components/AccountHeader.tsx` (`pushDialog(<LocaleSelectorDialog />)`).
Pass the languages the app has translations for, e.g. its `supported-languages.json`:

```tsx
import supportedLanguages from "../../../assets/data/supported-languages.json";

pushDialog(<LocaleSelectorDialog supportedLocales={supportedLanguages} />);
```

Without it the call no longer compiles, and a dialog rendered anyway offers no language.

Nothing to do for samedis-ui: `ProfileMenu.tsx` and `LandingPageShell.tsx` pass its
`supported-languages.json`.
