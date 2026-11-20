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

- samedis-ui: the country selects of `COUNTRY_OPTIONS` (contact, tenant, tenant billing, the
  billing address fields, quote request) offer them, `validateBillingContact` accepts them, and
  the device models' `available_in_countries` (`RegionSelector`, `getCountries`) lists them under
  their regions (Aruba, Curaçao and Sint Maarten under the Caribbean, Åland under Northern
  Europe, …). The samedis backend accepts all 249 codes for these fields.
- A `Record<CountryCode, …>` that lists every code needs entries for `BV` and `HM` (neither app
  has one).

identity-management-frontend uses neither `CountryCodes` nor `useCountryOptions`: nothing to do
there.
