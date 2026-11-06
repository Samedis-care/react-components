# Schedule entries wrap long words

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Schedule` (`WeeklySchedule`, `ScrollableSchedule`)

## What changed

The entries of both schedules (`DayContents`, theme name `CcDayContents`, slot `button`) now
set `overflow-wrap: anywhere`. A word longer than its entry is broken onto the next line
inside the entry. It used to run out of the entry: in `WeeklySchedule` over the next day's
column, in `ScrollableSchedule` past the right edge of the list. Text that fits is laid out
as before.

## Why

Long compound words are common in German titles ("Medizinproduktebetreiberverordnungsprüfung",
"Sicherheitstechnische Kontrolle"); in the weekly view's narrow columns they were drawn over
the neighboring day's entries.

## Migration

Nothing to do. Entries with long words get taller, so expect them to look different in
screenshots. A theme that prefers hyphenation can add `hyphens: "auto"` to
`CcDayContents`' `button` slot; the browser then hyphenates in the language of the page's
`lang` attribute and still breaks anywhere where it cannot.
