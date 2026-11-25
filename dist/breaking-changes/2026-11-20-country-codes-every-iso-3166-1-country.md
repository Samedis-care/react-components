# CountryCodes and useCountryOptions list every ISO 3166-1 country

- **Date:** 2026-11-20
- **Kind:** behavior, type
- **Scope:** `standalone/CountryFlags` (`CountryCodes`, `useCountryOptions`, `CountryCode`),
  `assets/data/countries.json`

## What changed

- `CountryCodes`, `assets/data/countries.json` and so `useCountryOptions()` list every country
  and territory ISO 3166-1 assigns a code to: 249 countries instead of 234. New are Aruba
  (`AW`), Åland Islands (`AX`), St. Barthélemy (`BL`), Bouvet Island (`BV`), Cocos (Keeling)
  Islands (`CC`), Curaçao (`CW`), Christmas Island (`CX`), Western Sahara (`EH`), Heard &
  McDonald Islands (`HM`), St. Martin (`MF`), New Caledonia (`NC`), Norfolk Island (`NF`),
  French Polynesia (`PF`), Svalbard & Jan Mayen (`SJ`) and Sint Maarten (`SX`).
- `CountryCode` gains `BV` and `HM`, with their flags (Norway's and Australia's). Every
  `CountryCode` but Kosovo's `XK` is now in `CountryCodes`.
- `CountryCodes` is in code order throughout (`SS` came before `SE`).

## Why

The list was the UN's, which leaves out these territories although they have ISO 3166-1 codes,
postal addresses of their own and a name in every language of the library. A country select
could not offer them, and a record holding one of their codes (from an import, or saved
through an API that accepts ISO 3166-1 codes) had no option to show. `XK` stays out of
`CountryCodes`: it is a user-assigned code, not an ISO 3166-1 one, and validators of ISO 3166-1
codes refuse it. It keeps its flag and name for the language dialog.

## Migration

Nothing to do in code. Expect the 15 territories in every country select built from
`CountryCodes` or `useCountryOptions()`:

- Country selects, validators and region lists built on them offer and accept them; a backend
  that validates these fields must accept all 249 codes.
- A `Record<CountryCode, …>` that lists every code needs entries for `BV` and `HM`.
