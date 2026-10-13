# The checkbox box reaches 3:1

- **Date:** 2026-10-13
- **Kind:** behavior
- **Scope:** `standalone/UIKit` (`Checkbox`), and everything that renders it (the DataGrid select
  column and select all, the DataGrid filters and settings dialog, `BaseSelector`,
  `ModelDataTypeBooleanCheckboxRendererCC`)

## What changed

The box of `Checkbox` is no longer drawn in `palette.divider`:

- enabled: the colour of MUI's input underline, `rgba(0, 0, 0, 0.42)` (`rgba(255, 255, 255, 0.7)`
  in dark mode), so the box is darker than before
- disabled: `palette.action.disabled`, so a disabled box is lighter than an enabled one (before,
  the two looked the same)

The box's corners are rounded by `shape.borderRadius` instead of a fixed 2px.

The DataGrid's row checkboxes (`CcDataGrid` `selectCheckbox`) are rounded the same way, box and
root. The cell hides its children's overflow, so the root clips the box: with MUI's round root the
box was cut down to a circle, of which only four short strokes showed, and a root rounder than the
box cut through the box's border at the corners.

## Why

`divider` is a separator colour. An unchecked box drawn in it is hard to see: about 1.32:1 against
white with MUI's default divider, 1.21:1 with a lighter one such as `#E5EAF2`. WCAG 2.1 (SC 1.4.11)
asks for 3:1 for the boundary of a control, and the underline colour reaches 3.03:1 against white.

## Migration

Nothing to do; expect darker boxes, lighter disabled boxes and the theme's corners in screenshots.

- On a `background.paper` other than white, check that the box still reaches 3:1 against it.
- To draw the box in another colour, set it in the theme through `CcCheckbox` `styleOverrides`
  (`root: { "& > svg": { borderColor: … } }`).
