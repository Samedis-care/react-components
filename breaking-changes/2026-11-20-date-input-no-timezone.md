# DateInput has no timezone prop and ignores a timezone set in the theme

- **Date:** 2026-11-20
- **Kind:** type, behavior
- **Scope:** `standalone/UIKit/InputControls` (`DateInput`), `backend-integration/Model`
  (`ModelDataTypeDateRendererCC` and `ModelDataTypeDateNullableRendererCC`, whose constructor
  props are `DateInput`'s)

## What changed

`DateInput`'s props no longer include MUI's `timezone`. The field always shows and reports
the stored calendar day, in the browser's timezone as before, also when the theme sets a
`timezone` for the date pickers (`components.CcLocalizedKeyboardDatePicker.defaultProps` or
`components.MuiDatePicker.defaultProps`). The model date renderers take `DateInput`'s props,
so their constructor props lose `timezone` too.

`LocalizedKeyboardDatePicker`, `LocalizedDatePicker` and `DateTimeInput` keep `timezone`.

## Why

`DateInput` deals in calendar days (date-only values, 12:00 UTC; see
[docs/DateOnlyValues.md](../docs/DateOnlyValues.md)), which are the same day in every
timezone, so a timezone has no meaning for it. Passed anyway, it moved the day: with
`timezone="UTC"` in Berlin, a stored 13 August showed as 12 August, and raising the day on
screen to 13 August saved 14 August.

## Migration

Nothing to do: no app passes `timezone` to `DateInput` or to a model date renderer. Code that
did gets a type error; remove the prop.

```tsx
// before
<DateInput value={day} onChange={setDay} timezone="UTC" />
// after
<DateInput value={day} onChange={setDay} />
```
