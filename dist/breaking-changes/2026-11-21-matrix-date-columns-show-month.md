# buildDateColumns shows the month on the first column and on every 1st

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `standalone/Matrix`

## What changed

`buildDateColumns` labels the first column of the range and the first day of every month
with the day and the localized short month. The weekday below stays on every column:

| Locale | Columns from February 26th       |
| ------ | -------------------------------- |
| en-GB  | 26 Feb · 27 · 28 · 1 Mar · 2     |
| en-US  | Feb 26 · 27 · 28 · Mar 1 · 2     |
| de-DE  | 26. Feb. · 27 · 28 · 1. März · 2 |

Those labels are strings, formatted with
`Intl.DateTimeFormat(locale, { day: "numeric", month: "short" })`; every other label is
still the day number as a number. In a column narrower than its label (a two-digit day in
German, French or Russian below about 56px, such as "28. Sept."), the label wraps onto a
second line inside the header.

The new option `showMonths` (default `true`) turns it off: with `showMonths: false` every
label is the day number, as before.

## Why

The column headers showed only the day number and the weekday, so nothing marked where one
month ended and the next began, and in a range of several months a day such as "15 SUN"
could be in any of them.

## Migration

Nothing to do for grids that use the default column header: expect the month next to the
first day number and next to every 1st in screenshots. A grid that shows its month
elsewhere (a month heading above a range of one month) can pass `showMonths: false`.

**Required for apps that read `column.label` of a `buildDateColumns` column as a number**
(in a `renderColumnHeader`, for sorting or arithmetic): the label of the first column and
of every 1st is now a string such as "1 Mar". Pass `showMonths: false`, or read the day
from the column key, which is the ISO date:

```ts
const day = Number(column.key.slice(8)); // key: "2026-03-01" → 1
```
