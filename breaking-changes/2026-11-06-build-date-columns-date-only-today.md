# buildDateColumns reads today and accent as date-only values

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Matrix`

## What changed

`buildDateColumns` reads its `today` and `accent` days the way the library reads date-only
values (`toDateOnly`, see [docs/DateOnlyValues.md](../docs/DateOnlyValues.md)):

- `"YYYY-MM-DD"` and a date-only value's serialization (`"2026-03-04T12:00:00.000Z"`,
  exactly 12:00 UTC in any offset notation) mark that day in every timezone. In UTC+12 and
  beyond (New Zealand, Fiji, Tonga, Samoa, Kiribati) a noon-UTC value used to mark the next
  day, so the grid opened at tomorrow and accented the wrong day.
- Any other timestamp still marks the day the viewer sees it on. A real timestamp that falls
  on exactly 12:00 UTC now counts as that UTC day.
- The values are parsed as ISO 8601 dates and timestamps (what `new Date` reads), no longer
  by moment. Formats only moment understood, such as `"20260304"`, ISO week dates
  (`"2026-W10-3"`) and ordinal dates (`"2026-063"`), now mark no day, like any other
  unparseable value.

Neither samedis-ui nor identity-management-frontend calls `buildDateColumns` today.

## Why

A date-only value's day is carried by its UTC parts. moment read it in the viewer's
timezone, which is a day ahead of UTC there, so every app that kept the day as a date-only
value marked the wrong day for users in those timezones.

## Migration

Nothing to do for `"YYYY-MM-DD"` strings and ISO timestamps. An app that passes another
format passes one of those instead: a date-only value's `toISOString()`, or
`moment(day).format("YYYY-MM-DD")` for a day in the viewer's timezone.
