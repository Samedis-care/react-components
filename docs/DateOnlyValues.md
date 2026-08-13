# Date-only values

How `components-care` represents calendar dates without a time component, and how to migrate
code that reads or writes them.

## The contract

> A **date-only value** is a `Date` anchored at **12:00 UTC** whose **UTC** calendar parts carry
> the date. Only the UTC parts are meaningful.

Noon is the anchor so the value stays on the same calendar day when a backend or database
truncates it anywhere from UTC-12 to UTC+11.

The rule that keeps this consistent:

> **Never read a date-only value with the local getters** — `getDate()`, `getFullYear()`,
> `toLocaleDateString()`, `moment(value)`, `moment(value).format()`, `startOf("day")`.

Mixing local getters with a UTC anchor shifts the day by one, in one of two directions
depending on the offset:

| what the code does | breaks in | example |
| --- | --- | --- |
| reads a noon-UTC value with **local** getters | UTC+12 and beyond | Auckland, Chatham (+12:45), Fiji, Apia, Tonga, Kiritimati (+14) |
| builds a value from `new Date("2026-08-13")` (UTC midnight) using **local** parts | everything behind UTC | all of the Americas, Pago Pago, UTC-12 |

The first one **compounds**: every save/load cycle adds another day, so a record in Auckland
walks forward one day per edit.

## API

All helpers are exported from the package root:

```ts
import {
  normalizeDate,
  normalizeDateUtc,
  parseDateOnly,
  denormalizeDate,
  formatDateOnly,
} from "components-care";
```

| helper | direction | use for |
| --- | --- | --- |
| `normalizeDate(date)` | local parts → noon UTC | user input: date pickers, `new Date()` ("today") |
| `normalizeDateUtc(date)` | UTC parts → noon UTC | a `Date` that already came off the wire |
| `parseDateOnly(string)` | ISO string → noon UTC | `"2026-08-13"` **and** `"2026-08-13T12:00:00.000Z"` |
| `toDateOnly(value)` | anything → noon UTC | a field that may receive either a date or a timestamp — see [Timestamps rendered as dates](#timestamps-rendered-as-dates) |
| `dateOnlyFromDateTime(value)` | instant → noon UTC | a value known to be a timestamp (`created_at`), rendered as a date |
| `denormalizeDate(date)` | noon UTC → local midnight | handing a value to a picker or anything else that reads local time |
| `formatDateOnly(date, locale, options?)` | noon UTC → string | display; formats with `timeZone: "UTC"`, which callers cannot override |

The time of day of the input is ignored by `normalizeDate` / `normalizeDateUtc` / `parseDateOnly`,
so it is safe to pass a picker value that carried over a time part.

Serialization is unchanged: `value.toISOString()` → `"2026-08-13T12:00:00.000Z"`.

## Timestamps rendered as dates

A calendar date and an instant are different things, and a field declared with a date type
(`ModelDataTypeDateNullableRenderer*`) is routinely pointed at a backend **timestamp** —
`created_at`, `last_activity_at` — to show it as a plain date in a DataGrid.

Which day to show differs between the two:

- a **date** shows that date, everywhere
- a **timestamp** shows the calendar day the **viewer** sees it on — `2026-08-13T22:30:00Z` is
  already the 14th in Berlin, and `2026-08-13T02:00:00Z` is still the 12th in New York

`TypeDate` / `TypeDateNullable` `deserialize` handle this through `toDateOnly`, which decides
from the value that arrived:

| what arrived | read as | example |
| --- | --- | --- |
| `"2026-08-13"` | that date | Rails serializes a `date` column this way |
| exactly 12:00 UTC, any offset notation | that date | this library's own serialization — see below |
| any other time of day, incl. `00:00:00Z` | instant → viewer's local day | `created_at` off a `datetime` column |
| a string without a stated offset (`"2026/08/13"`, `"2026-08-13T22:30:00"`) | instant → viewer's local day | JS parses these in local time, so their own parts are already the viewer's day |

Noon UTC has to count as a date rather than an instant because that is what this library
serializes date-only values to. When a date-only field is backed by a **datetime** column the
API echoes `"2026-08-13T12:00:00.000Z"` back, and reading that as an instant would move the day
forward on every save/load cycle in UTC+12 and beyond.

Two cases stay ambiguous, both narrow, and both resolvable by using the explicit helpers:

- a real timestamp falling on exactly 12:00 UTC is read as a date (so a UTC+12 viewer sees the
  UTC day rather than their local day)
- a `Date` built from local midnight *is* exactly 12:00 UTC in UTC+12, so `toDateOnly` reads it
  as the previous day there — pass a string, or call `normalizeDate` directly, for picker input

Where the kind is known, say so explicitly instead of relying on the above:

```ts
formatDateOnly(dateOnlyFromDateTime(record.created_at), locale);  // known timestamp
formatDateOnly(parseDateOnly(record.birthday), locale);           // known calendar date
```

Note that converting a timestamp to a date is lossy and viewer-relative. If a field only ever
*displays* as a date but is otherwise a timestamp, keeping it a datetime type and formatting the
cell is the more honest model — use `dateOnlyFromDateTime` only when a real date-only value is
needed, e.g. to feed a date picker or a date filter.

## Migration checklist

### 1. Parsing from the backend

```ts
// before — loses a day in every timezone behind UTC when the API sends "2026-08-13"
const date = new Date(record.birthday);
// after — a value known to be a calendar date
const date = parseDateOnly(record.birthday);
// after — a value known to be a timestamp shown as a date
const day = dateOnlyFromDateTime(record.created_at);
// after — either kind, decided from the value (what the model types do)
const value = toDateOnly(record.whatever);
```

### 2. Display

```ts
// before — shows the next day in Auckland, Apia, Kiritimati …
date.toLocaleDateString(locale, ToDateLocaleStringOptions);
// after
formatDateOnly(date, locale, ToDateLocaleStringOptions);
```

`ToDateLocaleStringOptions` (also exported from the package) stays as-is — don't add
`timeZone: "UTC"` to it globally, it is shared with real timestamps.

### 3. Feeding a picker (or anything that reads local time)

```tsx
// before
<LocalizedKeyboardDatePicker value={value ? moment(value) : null} … />
// after
<LocalizedKeyboardDatePicker value={value ? moment(denormalizeDate(value)) : null} … />
```

Same for `moment(value).format(…)`, `moment(value).startOf("day")`, `value.getDate()` and
friends: convert with `denormalizeDate` first, or read the UTC parts directly.

### 4. Writing from a picker

```ts
// before
onChange={(date) => handleChange(localDateToUtcDate(date.toDate()))}
// after
onChange={(date) => handleChange(normalizeDate(date.toDate()))}
```

`localDateToUtcDate` is **deprecated** for this purpose — it anchors at UTC *midnight*, which
reads back as the previous day everywhere behind UTC.

### 5. "Today" and other locally-derived dates

```ts
// after
const today = normalizeDate(new Date());
```

### 6. Comparing values

Two date-only values for the same day are byte-identical, so `getTime()` equality and
`toISOString()` equality both work. Don't compare a date-only value against a real timestamp.

## Finding the sites in a codebase

```bash
# local reads that may be looking at a date-only value
grep -rnE "toLocaleDateString|localDateToUtcDate|setUTCHours|getTimezoneOffset" src/
# pickers and moment() calls fed from model data
grep -rn "moment(" src/ | grep -iE "date|day|birthday|expir|valid"
# raw parsing of date fields
grep -rnE "new Date\(" src/ | grep -iE "date|day|birthday|expir|valid"
```

## Breaking changes in the library

- `DateInput` (`src/standalone/UIKit/InputControls`) now speaks date-only values on **both**
  `value` and `onChange`. It used to emit UTC **midnight** and interpret `value` by its local
  parts. Code that consumed its output directly, or built values for it with
  `localDateToUtcDate`, needs steps 3 and 4 above — otherwise it is now off by one in the
  other direction.
- `TypeDate` / `TypeDateNullable` `deserialize` now reads calendar dates by their UTC day and
  timestamps by the viewer's local day (see
  [Timestamps rendered as dates](#timestamps-rendered-as-dates)); `stringify` formats by the
  UTC day. Previously everything was read by the viewer's local day, which was right for
  timestamps and a day off for calendar dates in every timezone behind UTC.
- The deep import path `components-care/dist/backend-integration/Model/Types/Utils/DateUtils`
  is gone. Import from the package root instead.

## Test pattern

The library's suite is table-driven over the full offset range using `process.env.TZ`, which
Node applies to `Date` and `Intl` at runtime. Copy this into the webapps' suites:

```ts
// @vitest-environment node
import { afterEach, expect, it } from "vitest";
import { normalizeDate, parseDateOnly, denormalizeDate, formatDateOnly } from "components-care";

const ZONES = [
  "Pacific/Kiritimati",   // UTC+14
  "Pacific/Apia",         // UTC+13
  "Pacific/Chatham",      // UTC+12:45 / +13:45
  "Pacific/Auckland",     // UTC+12 / +13
  "Australia/Lord_Howe",  // UTC+10:30 / +11
  "Asia/Kolkata",         // UTC+5:30
  "Europe/Berlin",        // UTC+1 / +2
  "UTC",
  "America/New_York",     // UTC-5 / -4
  "Pacific/Marquesas",    // UTC-9:30
  "Pacific/Pago_Pago",    // UTC-11
  "Etc/GMT+12",           // UTC-12
];

const ORIGINAL_TZ = process.env.TZ;
afterEach(() => {
  if (ORIGINAL_TZ === undefined) delete process.env.TZ;
  else process.env.TZ = ORIGINAL_TZ;
});

const inZone = <T,>(tz: string, fn: () => T): T => {
  process.env.TZ = tz;
  return fn();
};

it("keeps the day in every timezone", () => {
  for (const tz of ZONES) {
    expect(
      inZone(tz, () => formatDateOnly(parseDateOnly("2026-08-13"), "en-CA")),
      tz,
    ).toBe("2026-08-13");
  }
});
```

Worth covering, beyond a single happy path:

- both DST states (a southern-winter and a southern-summer date), a year boundary, a leap day
- **repeated** save/load cycles — the +12 bug only compounds across cycles, one round trip can
  look fine
- date-only strings (`"2026-08-13"`) as well as full ISO timestamps from the API
- the zones that skip local midnight for DST (`America/Havana` 2026-03-08,
  `America/Santiago` 2026-09-06, `Asia/Beirut` 2026-03-29) — `denormalizeDate` lands on 01:00
  there, and the calendar day still has to match

Reference tests in this repo: [test/utils/dateOnlyUtils.test.ts](../test/utils/dateOnlyUtils.test.ts),
[test/backend-integration/TypeDate.test.ts](../test/backend-integration/TypeDate.test.ts),
[test/standalone/DateInput.test.tsx](../test/standalone/DateInput.test.tsx).
