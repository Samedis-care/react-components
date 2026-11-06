# The import wizard writes the calendar day a date-only conversion names

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** CRUD import wizard (`backend-components/CRUD/Import`): the review (Step3ValidateReview, `useImportStep3Logic`) and the import (Step4Import, `useImportStep4Logic`)

## What changed

When a conversion (an `importConfig` entry or a script typed in Connect data) returns a
Date for a date-only field (a `ModelDataTypeDate` or `ModelDataTypeDateNullable`, which
includes every renderer and app type built on them), the review and the import now use the
date-only value of the day that Date names: 12:00 UTC of that day, the value the date
pickers write.

- A Date at exactly 00:00 or 12:00 UTC names its UTC date: `new Date("2024-03-31")`,
  `Date.UTC(…)`, `toDateOnly(…)`.
- Any other Date names its local date: `new Date(record.Born)` of a date cell, which
  arrives as local time without an offset (`"2024-03-31T00:00:00"`).

Before, the Date was written as the instant it holds. A date cell 2024-03-31 converted with
`new Date(record.Born)` was sent as `"2024-03-30T23:00:00.000Z"` in Berlin and shown as
30.03.2024 in the review.

Date-time fields keep their Date as it is, also those whose filter type is `"date"`.
Other values and an invalid Date are unchanged.

## Why

Every date-only value an import wrote east of UTC was a day early, without an error.
`new Date(record.Born)` is the conversion a script in Connect data can write without
library helpers.

## Migration

Nothing to do in the apps' code (no app passes `importConfig`).

Conversion scripts that worked around the shift by moving the day (for example adding a
day to the parsed date) now write the day after; drop the workaround. In UTC+12 local
midnight is 12:00 UTC, so `new Date(record.Born)` names the day before there;
`new Date(record.Born.slice(0, 10))` names the cell's day in every timezone.
