# Locale and currency data come from CLDR 49

- **Date:** 2026-10-26
- **Kind:** behavior
- **Scope:** `assets/data/*.json`, `assets/i18n/<lang>/{countries,currencies,languages,locale-switcher}.json`

## What changed

The generated locale and currency data is built from CLDR 49 instead of CLDR 48.

- `supported-locales.json` and the `locale-switcher` translations no longer contain `ht-HT`,
  `pap-CW`, `ss-SZ` and `tpi-PG`. They now contain `ady-RU` and `kbd-RU`.
- The `languages` translations no longer contain the native names (`<code>-native`) of `ab`,
  `an`, `co`, `gn`, `ht`, `io`, `nv`, `ny`, `ss` and `wa`.
- The currency `CNX` (Chinese People's Bank Dollar) is gone from `currencies.json`,
  `currency-formatting.json`, `currencies-users.json`, `currency-relevance.json` and the
  `currencies` translations.
- `currency-formatting.json` gives `PKR` 2 digits instead of 0.
- English territory names: `SH` is "St. Helena, Ascension & Tristan da Cunha", `TF` "French
  Southern and Antarctic Lands", `HM` "Heard Island & McDonald Islands". The previous names
  are available as `<code>-alt-short`.
- The `currencies` translations add `symbol-alt-variant` for `AED`, `MVR` and `OMR` (the new
  Unicode 17 currency signs) and `CHF.symbol-alt-narrow` ("Fr."). In Dutch,
  `BYN.symbol-alt-narrow` is "Br".
- `locale-relevance.json` uses CLDR 49's population figures.
- `currencies-alive.json` is sorted alphabetically, and `currency-relevance.json` uses the
  exchange rates of the day it was generated.

## Why

CLDR 49 no longer ships locales below Basic coverage, so their native names and the
locale-switcher entries built from them are gone. The remaining changes are CLDR 49's data
updates.

## Migration

An app that offers `supported-locales.json` as options (e.g. the locales of an app in identity
management) no longer offers the four removed locales. A value already stored as one of them
has no `locale-switcher` translation and shows its translation key. Nothing to do otherwise.
