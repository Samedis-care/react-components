# The DataGrid's header buttons on tablets and phones and its column settings draw a focus ring

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (header below md, column settings panel)

## What changed

A keyboard-focused control (MUI's `Mui-focusVisible`) now gets a 2px solid outline in
`palette.primary.main`:

- the header's icon buttons below md: "Columns", "Reset", "Export" and "Import", and on
  phones with a filter bar "More options": 2px outside the round button;
- the phone's "Search" button: 2px outside the round button;
- the column settings' "Visible" and "Pin" checkboxes: around the box, 2px away from the
  icon, with the theme's corner radius;
- the column settings' "Close": 2px outside the filled button, so the panel's background
  shows between the fill and the ring.

A mouse click shows no ring. MUI's focus ripple and the button's focus shadow stay as they
were. From md up the header's buttons already drew this ring (`SmallestIconButton`).

When the theme sets MUI's `focusVisible` option, MUI draws that ring on these controls, as
it does on its own, and the DataGrid adds none of its own.

## Why

Keyboard focus on these controls was shown only by MUI's focus ripple or, on "Close", a
deeper shadow: a change of at most 1.5:1 ("Close" 1.63:1) with no pixel at 3:1, so on a
tablet, a phone or at 200% zoom the user could not see which control Enter or Space would
operate, and forced colors (Windows High Contrast) show nothing of it (WCAG 2.4.7, 1.4.11).
The outline contrasts with the panel like `primary.main` does, and forced colors keep
outlines.

## Migration

Nothing to do, but expect the ring in screenshots of keyboard-focused DataGrid headers on
tablets and phones and of the column settings. To give MUI's and the library's controls
one ring of your own, set MUI's `focusVisible` theme option.
