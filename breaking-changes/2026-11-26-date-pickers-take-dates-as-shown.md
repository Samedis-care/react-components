# The date pickers take dates in the order the date renderers show them

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `framework/CCI18nProvider` and `Framework`'s date pickers
  (`LocalizedKeyboardDatePicker`, `LocalizedDatePicker`, `LocalizedDateTimePicker` and
  what is built on them: `DateInput`, `DateTimeInput`, the model's date and date-time
  renderers, the DataGrid's date filters); moment's global locale

## What changed

`CCI18nProvider` (which `Framework` renders) sets moment's short date format (`L`) of the
current locale to the one the date renderers display dates in (`toLocaleDateString` with
`ToDateLocaleStringOptions`): Intl's order of day, month and year and the text between
them, with day and month in two digits and the year in four. The pickers' field (`L`,
`L LT`) takes and shows dates in it.

- A region moment has no locale for used moment's locale of its language: en-ZA, en-NG,
  en-PK, en-KE and 71 more English regions got en's `MM/DD/YYYY`, es-PA and es-PR es's
  `DD/MM/YYYY`. Such a region now gets a moment locale of its own name, based on the
  language's, with the renderers' `L`: en-ZA `YYYY/MM/DD`, en-NG `DD/MM/YYYY`, es-PA and
  es-PR `MM/DD/YYYY`, es-CL and en-MV `DD-MM-YYYY`, uz-AF `YYYY-MM-DD`. `moment.locale()`
  is then the region's name (`"en-za"`), not the language's (`"en"`).
- Where moment's own locale of the region has another `L`, it is changed: es-US
  `MM/DD/YYYY` becomes `DD/MM/YYYY`, nl-BE `D/MM/YYYY` becomes `DD/MM/YYYY`.
- Where moment's `L` already is the renderers' (en-US, en-GB, de, fr, it, nl, ru and most
  of their regions), nothing changes, also not the name `moment.locale()` gives.
- Moment's other formats (`LT`, `LL`, …) stay moment's, also in the new locales.

`Framework`'s `LocalizationProvider` takes the moment locale `CCI18nProvider` applied last
as `adapterLocale` (e.g. `"en-za"`, `"de"`), no longer the components-care locale
(`"en-ZA"`, `"de-DE"`), so a picker already shown changes to the new format once the
locale is applied. Before the first one applies, it takes the components-care locale, as
before.

## Why

The renderers and grids show dates with Intl, the pickers in moment's `L`. For 75 of the
124 English regions moment has no locale and the pickers expected `MM/DD/YYYY` while the
screen showed `31/12/2026` (en-ZA `2026/12/31`): a date typed the way it is shown became
another day (`05/01/2026` the 1st of May) or no valid date.

## Migration

Nothing to do. An app that formats or parses with moment's `L` under the global locale
(`moment(value).format("L")`) gets the new format in these locales too, the one the
library's renderers show. An app that compares `moment.locale()` with a language code gets
the region's name in these regions (`"en-za"`).
