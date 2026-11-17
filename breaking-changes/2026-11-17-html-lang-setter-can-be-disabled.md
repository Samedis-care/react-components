# `disableHtmlLanguageAttributeSetter` leaves `<html lang>` to the app

- **Date:** 2026-11-17
- **Kind:** behavior
- **Scope:** `framework/Framework`, `framework/CCI18nProvider`

## What changed

With `disableHtmlLanguageAttributeSetter` set on `Framework` (or on `CCI18nProvider`), the
provider no longer writes the `lang` attribute of the `<html>` element. Before, the prop was
ignored: every language change set `<html lang>` to `ComponentsCareI18n`'s language without
region (e.g. "de" for "de-DE"), overwriting the value the app had set.

A change of the prop after mount takes effect: turning it off sets `<html lang>` to the
current language right away, turning it on keeps the value until the app changes it.

Without the prop, `<html lang>` still follows `ComponentsCareI18n` as before.

## Why

An app that sets `<html lang>` itself, e.g. to the language of the content a route shows,
had its value replaced on every language change. Screen readers pick their voice from it,
and browsers offer page translation based on it.

## Migration

Nothing required for an app that doesn't pass `disableHtmlLanguageAttributeSetter`.

An app that passes it now owns `<html lang>`: set it at start-up and on every language
change, or drop the prop to let the Framework set it.

```ts
const syncHtmlLang = () => {
	document.documentElement.lang = getCurrentLanguage(ComponentsCareI18n);
};
syncHtmlLang();
ComponentsCareI18n.on("languageChanged", syncHtmlLang);
```

An app that already writes `document.documentElement.lang` itself next to the Framework can
pass the prop, so that its value is the only one written.
