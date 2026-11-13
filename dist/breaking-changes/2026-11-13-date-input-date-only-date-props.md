# DateInput takes and gives every date as a date-only value

- **Date:** 2026-11-13
- **Kind:** type, behavior
- **Scope:** `standalone/UIKit/InputControls` (`DateInput`), `backend-integration/Model`
  (`ModelDataTypeDateRendererCC` and `ModelDataTypeDateNullableRendererCC`, whose constructor
  props are `DateInput`'s)

## What changed

`DateInput`'s date props other than `value` and `onChange` used to be MUI's: local `Moment`s.
They now take and give date-only values like `value` and `onChange` do, a `Date` at 12:00 UTC
whose UTC parts carry the day (see [docs/DateOnlyValues.md](../docs/DateOnlyValues.md)):

| Prop | Before | Now |
| --- | --- | --- |
| `minDate`, `maxDate`, `referenceDate` | `Moment` | `Date` (date-only) |
| `shouldDisableDate` | called with a `Moment` | called with the day as a date-only `Date` |
| `shouldDisableMonth` | called with a `Moment` | called with a day of the month as a date-only `Date`: the first in the month view, the entered day when the entry is validated |
| `shouldDisableYear` | called with a `Moment` | called with a day of the year as a date-only `Date`: 1 January in the year view, the entered day when the entry is validated |
| `onAccept` | `(value: Moment \| null, context)` | `(value: Date \| null, context)`; `null` also for an entry that is no valid day |
| `onError` | `(error, value: Moment \| null)` | `(error, value: Date \| null)`; `null` also for an entry that is no valid day (`"invalidDate"`) |
| `onMonthChange`, `onYearChange` | called with a `Moment` | called with the month's first day / the year's 1 January as a date-only `Date` |
| `dayOfWeekFormatter` | called with a `Moment` | called with a day of the weekday as a date-only `Date` |
| `defaultValue` | accepted, had no effect | removed: the input is always controlled |

An Invalid Date passed as `minDate`, `maxDate` or `referenceDate` counts as not set. `slots`,
`slotProps` and `viewRenderers` stay MUI's and see `Moment`s.

## Why

`value` takes a date-only `Date`, so passing the same kind of value as a bound was the
natural call, and it threw "value.isValid is not a function": the error boundary replaced the
page. Converting it with `moment(day)` read the local day, so in UTC+12 and beyond the bound
was a day late, and `minDate={moment(day)}` rejected `day` itself. The days the callbacks
received had the same problem the other way round: `onAccept` gave a `Moment` at local midnight
whose `toDate()`, read as a date-only value, is the day before there.

## Migration

Required for every `DateInput`, and every `ModelDataTypeDateRendererCC` /
`ModelDataTypeDateNullableRendererCC` constructed with props, that passes one of the props
above. TypeScript flags each of them.

- Bounds: pass the date-only value itself.

  ```tsx
  // before
  <DateInput value={value} minDate={moment(denormalizeDate(min))} maxDate={moment("2099-12-31")} … />
  // after
  <DateInput value={value} minDate={min} maxDate={parseDateOnly("2099-12-31")} … />
  ```

- Callbacks: read the `Date` they receive by its UTC parts, or with `formatDateOnly`, and
  drop the conversion of what they hand on.

  ```tsx
  // before
  shouldDisableDate={(day) => day.day() === 0}
  onAccept={(day) => save(day ? normalizeDate(day.toDate()) : null)}
  // after
  shouldDisableDate={(day) => day.getUTCDay() === 0}
  onAccept={(day) => save(day)}
  ```

- `defaultValue`: remove it; `value` is what the input shows.

In the apps:

- SCF, `src/pages/TenantSpecific/Devices/Inventorization/Capture/StepPhotos.tsx`
  (`nextMaintenanceBounds`): required. `minDate: moment(NEXT_MAINTENANCE_MIN_DAY)` and
  `maxDate: moment(getNextMaintenanceMaxDay(new Date()))` become
  `parseDateOnly(NEXT_MAINTENANCE_MIN_DAY)` and `parseDateOnly(getNextMaintenanceMaxDay(new Date()))`
  (both are `YYYY-MM-DD` strings).
- SCF, the date renderers constructed with props (`NextMaintenanceEventModel`,
  `DeviceTaskModel`, `AdHocTrainingModel`) pass none of these props: nothing to do.
- IMF renders no `DateInput`: nothing to do.
