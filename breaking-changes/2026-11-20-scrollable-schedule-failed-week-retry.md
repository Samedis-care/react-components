# A failed week of ScrollableSchedule keeps its week line and offers Retry

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Schedule` (ScrollableSchedule)

## What changed

When `loadWeekCallback` rejects for a week, the week no longer turns into one line with
the error's `message`. It keeps its "Week N, DD MMM - DD MMM" line, and below it an error
alert (`role="alert"`, so screen readers announce it) titled "Week N could not be loaded"
(new i18n key `standalone.schedule.week-load-error`), with the error's `message` under the
title and a Retry button (new key `standalone.schedule.retry`). The button is described
by the alert's text, so each failed week's Retry says which week it loads.

Retry calls `loadWeekCallback` again for that week, with the current filter values. Until
the result arrives a spinner shows below the week line; then the week shows its day rows,
or a new alert if it failed again. Retry moves the keyboard focus to the week line, which
stays in place when the rows arrive.

## Why

A failed week showed neither its number nor its dates, so in a long list nobody could tell
which week had failed; the error was not announced (WCAG 4.1.3 Status Messages, 1.3.1
Info and Relationships); and the only way to load the week again was to change a filter
or the language.

## Migration

- Nothing required for the apps' code. `loadWeekCallback` can now be called again with
  the same week offset and filter values when the user retries a failed week.
- A failed week is taller than before (the week line plus an alert box): expect it in
  screenshots.
- A test that looked for the error's message as the whole text of an element still finds
  it with `getByText(message)`; the alert as a whole is `getByRole("alert")`, and the
  button `getByRole("button", { name: "Retry" })`.
