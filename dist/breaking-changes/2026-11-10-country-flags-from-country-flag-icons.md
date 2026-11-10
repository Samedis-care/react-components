# Country flags come from country-flag-icons

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `assets/img/countries/*.svg`, so `CountryFlags`, `CountryFlag`, `useCountryOptions` and `LocaleSelector`

## What changed

Every flag is now the flag of [country-flag-icons](https://www.npmjs.com/package/country-flag-icons)'
3x2 set (version 1.6.20) instead of react-world-flags. The map's keys and the file names are
unchanged.

- Every flag is 3:2. Flags of another ratio are drawn at 3:2: Switzerland and Vatican City (square),
  the United Kingdom, Qatar and the other 2:1 flags, Germany (5:3), and Nepal stands on a white 3:2
  field. `CountryFlag` draws every flag one and a half times as wide as it is high: 24x16 at the
  default size, 45x30 in the language dialog.
- Emblems and coats of arms are simplified for small sizes (Bhutan's dragon, the arms of Spain,
  Portugal, Ecuador and Mexico; the canton of the United States' flag has fewer stars). Some colors
  differ slightly.
- Syria's flag is the one in use since December 2024: green, white and black, three red stars.
- All 248 flags are 164 KB instead of 3.08 MB, the largest 5.3 KB instead of 245 KB.

## Why

react-world-flags has not changed a flag since 2023 and still showed Syria's flag of 1980–2024.
country-flag-icons follows flag changes, is released in versions, and is drawn for the icon sizes
at which the library and the apps show flags.

## Migration

Nothing to do; expect the new flags in screenshots. A bundler that inlines small assets now
inlines every flag: the apps' webpack config inlines files up to 8096 bytes, so the chunk that
imports `CountryFlags` holds all 248 flags (164 KB of SVG, before 185 KB for 185 flags), and the
54 flags it used to emit as separate files (2.9 MB, fetched when a country select opened) are gone.
