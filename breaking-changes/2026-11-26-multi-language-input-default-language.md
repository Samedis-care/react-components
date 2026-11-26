# MultiLanguageInput shows the other languages while only they have text, and `defaultLanguage` sets the required language

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls/MultiLanguageInput` (and so `ModelDataTypeLocalizedStringRenderer`)

## What changed

- A single-line field whose default language has no text while another enabled language
  has (`{ de: "Infusionspumpe" }` with the default language `en`) now shows the other
  languages' fields below the default one, with the translate button pressed
  (`aria-expanded="true"`). They stay as they are once the user presses the button or
  types, so emptying or filling the default language never shows or hides fields while
  typing. Whitespace counts as no text, as for the incomplete marker. Multiline fields
  are unchanged.
- New prop `defaultLanguage`: the language the record has to be filled in. When it is in
  `enabledLanguages`, its field is the first, labelled and required one for every viewer,
  whatever the UI language, and it wins over `ignoreI18nLocale`. While it is `null`,
  `undefined` or not enabled, the default language is chosen as before (the UI language
  when it is enabled and `ignoreI18nLocale` is not set, otherwise `enabledLanguages[0]`).
  `ModelDataTypeLocalizedStringRenderer` passes it through.

## Why

The first, labelled and required field was the viewer's UI language, while a record has
one language it must be filled in. A viewer with another UI language filled a field that
the validator did not check, and a text kept only in another language was hidden behind
the button, so users retyped it or thought there was none.

## Migration

**Required for any app whose localized field must hold text in one given language** (a
backend that derives its main text from that language, or a validator that checks one
language): pass that language as `defaultLanguage` and validate the same language.
Without it, the field marked required is the viewer's UI language, so a viewer whose UI
language differs fills a field the validator does not check, and saving is refused.
`required` stays display only, and `validatePresence` accepts an empty object:

```ts
title_translations: {
	type: new ModelDataTypeLocalizedStringRenderer({
		enabledLanguages: supportedLanguages,
		defaultLanguage: recordLanguage, // the language the record must be filled in
	}),
	visibility: {
		overview: ModelVisibilityGridView,
		create: ModelVisibilityEditRequired,
		edit: ModelVisibilityEditRequired,
	},
	validate: validateLocalizedPresenceFor([recordLanguage]),
	getLabel: () => t("title"),
	customData: null,
},
```

An app that reorders `enabledLanguages` and sets `ignoreI18nLocale` to put that language
first can pass it as `defaultLanguage` instead and keep its language order.

Nothing to do for the expanded fields; expect them in screenshots of records whose
default language is empty.
