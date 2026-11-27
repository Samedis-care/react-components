# ScrollableSchedule's week lines are headings with the year, and its days are named groups

- **Date:** 2026-11-27
- **Kind:** behavior, theme
- **Scope:** `standalone/Schedule` (ScrollableSchedule)

## What changed

- Each week's line is an `h3` heading; it was a `div`. It looks as before: no margin, and
  the font of the text around it.
- The week line ends with the year: "Week 42, 11 Oct - 17 Oct 2026". A week that runs into
  the next year names both years: "Week 1, 27 Dec 2026 - 02 Jan 2027".
- Each day row (the `root` slot of `CcScrollableScheduleDay`) is a group (`role="group"`)
  named by the day's full date, formatted `"dddd, LL"` in the day's moment locale
  ("Wednesday, October 14, 2026" in en, "Mittwoch, 14. Oktober 2026" in de). The full
  date is in the date label's cell, visually hidden; the short label ("14 Wed") is hidden
  from assistive technology, which reads the full date in its place.
- `CcScrollableScheduleDay` has two new slots: `label`, the cell with the date label
  (`position: relative`, so the hidden full date lies inside it), and `fullDate`, the
  visually hidden full date.

## Why

A screen reader read the entries' titles without their day or date, and its heading
navigation had nothing to jump between. The day labels have no month and the week lines
had no year, so in a long list nothing said which year a week is in.

Now a screen reader names the day and its date when focus moves into a day, and the
weeks can be reached by heading navigation. Every user sees the year on each week line.

## Migration

Nothing is required.

- The week headings are of level 3. On a page whose headings would then skip a level, put
  the schedule in a section with a heading of level 2.
- Tests or scripts that read a week line need the year ("Week 42, 11 Oct - 17 Oct 2026"),
  and an `h3` where they selected a `div`.
- A theme can style the date label's cell through `styleOverrides.label` of
  `CcScrollableScheduleDay`; keep it positioned (`relative` or another position) so the
  hidden full date stays inside it.
