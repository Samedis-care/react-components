# WeeklySchedule marks today's column by more than its color

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `standalone/Schedule` (WeeklySchedule)

## What changed

Today's day column in WeeklySchedule keeps its primary background and gets by default:

- a 4px bar in `palette.primary.main` on its top edge (the `::before` of the column's
  Paper, drawn over the column, so its labels stay in line with the other columns'
  labels),
- a bold weekday and date (`typography.fontWeightBold`; the entries keep their own
  weight),
- `aria-current="date"` on the column.

The column's Paper keeps the class `CcWeekViewDay-today`; the default style above is set
on that class, in the `paper` slot of `CcWeekViewDay`. Its weekday header has the class
`CcWeekViewDay-weekday` and inherits the column's font weight.

## Why

Until now only the background marked today's column, and nothing told assistive
technology which column was today. A screen reader now announces it as the current date.
The bar and the bold labels are not a color only, so they stay visible in forced-colors
mode (Windows contrast themes), which replaces background colors.

## Migration

Nothing is required.

SCF styles `&.CcWeekViewDay-today` in `components.CcWeekViewDay.styleOverrides.paper`
with a `secondary` background; its today column now also shows the bar (in SCF's primary
blue) and the bold weekday and date. A theme can restyle the mark in the same place, e.g.
the bar's color:

```ts
CcWeekViewDay: {
	styleOverrides: {
		paper: ({ theme }) => ({
			"&.CcWeekViewDay-today": {
				"&::before": { borderTopColor: theme.palette.secondary.dark },
			},
		}),
	},
},
```

Keep a mark that is not a color only (the bar, a border or the bold labels) when
restyling it.
