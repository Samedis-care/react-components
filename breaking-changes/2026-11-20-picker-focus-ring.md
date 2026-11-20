# The date pickers draw a keyboard focus ring in the calendar and on the open button

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/LocalizedDateTimePickers` (`LocalizedKeyboardDatePicker`,
  `LocalizedDatePicker`, `LocalizedDateTimePicker`), and through them `DateInput`,
  `DateTimeInput`, the model date renderers and the DataGrid's date and date-time filters.

## What changed

A keyboard-focused control of a picker now shows a 2px solid outline in
`palette.primary.main`:

- the button that opens the calendar ("Choose date"): 2px inside its edge, around the icon;
- in the open calendar, the desktop popup and the mobile dialog alike:
  - 2px outside the header's month arrows, the year and month buttons, and the buttons of
    the toolbar and the action bar (Cancel, OK, Next);
  - along the edge of a day, a time option and the header's view switch;
  - on a selected day or time option, which is filled in `palette.primary.main`, in its
    text colour (`palette.primary.contrastText`), 2px inside the edge;
  - 6px inside the date and time tabs of the mobile dialog.

MUI's tint, the darker fill of a selected day and the focus ripple stay. A mouse click shows
no ring.

The ring comes in through the picker's slots: `slots.openPickerButton` defaults to an
`IconButton` with the ring, and the calendar's ring goes into `slotProps.layout.sx`. A
caller's `slots.openPickerButton` replaces the button with the ring. A caller's
`slotProps.layout` is kept, and its `sx` comes after the ring.

When the theme sets MUI's `focusVisible` option, MUI draws that ring on the pickers' buttons
and options, as on its own controls, and CC adds none of its own.

## Why

MUI marked keyboard focus in the calendar only by a 12% tint of the primary colour on a day
or time option (about 1.2:1 on white), by `primary.dark` instead of `primary.main` on a
selected one (about 1.25:1), by a 12% or 4% grey on a year or month, and by a pulsing ripple
of about 1.5:1 on the open button and the buttons of the header and the action bar. A
keyboard user had to find the focused day among 31 by that tint, and forced colors showed
none of it (WCAG 2.4.7, 1.4.11). The outline contrasts with the calendar like `primary.main` does, and forced colors
keep outlines.

## Migration

Nothing to do, but expect the ring in screenshots of keyboard-focused pickers. A custom
`slots.openPickerButton` replaces the button with the ring, so it needs a focus indicator of
its own. To give MUI's and CC's controls one ring of your own, set MUI's `focusVisible` theme
option.
