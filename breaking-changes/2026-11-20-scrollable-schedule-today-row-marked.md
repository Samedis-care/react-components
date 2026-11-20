# ScrollableSchedule marks today's row by default

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Schedule` (ScrollableSchedule)

## What changed

Today's day row in ScrollableSchedule is marked by default:

- a 4px bar in `palette.primary.main` on the row's left edge (a `border-left`; the row's
  left padding shrinks by the same 4px, so its date label stays in line with the other
  rows' labels),
- its date label is bold (`typography.fontWeightBold`),
- `aria-current="date"` on the row.

The row's root keeps the class `CcScrollableScheduleDay-today`; the default style above is
set on that class, in the `root` slot of `CcScrollableScheduleDay`. Until now the class
had no style, so with the default theme today's row looked like every other row, and
assistive technology could not tell which row was today.

## Why

Today's row is where the date button in the header scrolls to, and the row a user looks
for first. A screen reader now announces it as the current date. The bar and the bold
label are not a color only, so they stay visible in forced-colors mode (Windows contrast
themes), which replaces background colors. WeeklySchedule already highlights today's
column by default.

## Migration

Nothing is required.

SCF styles `&.CcScrollableScheduleDay-today` in `components.CcScrollableScheduleDay.styleOverrides.root`
with a `secondary` background; its today row now also shows the bar and the bold label.
A theme can restyle the mark in the same place, e.g. its color:

```ts
CcScrollableScheduleDay: {
	styleOverrides: {
		root: ({ theme }) => ({
			"&.CcScrollableScheduleDay-today": {
				borderLeftColor: theme.palette.secondary.dark,
			},
		}),
	},
},
```

Keep a mark that is not a color only (the bar, a border or the bold label) when
restyling it.
