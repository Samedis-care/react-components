# DialogTitle's close icon has the color of MUI's default IconButton

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog/DialogTitle` (the close button, also in FullFormDialog)

## What changed

The X of DialogTitle's close button has the palette's `action.active` color, the color of
MUI's default IconButton: 54% black in MUI's light palette, white in the dark one. With a
theme of CSS variables it follows the color scheme. Before, it was `grey[500]` in both
palettes.

As before, a theme's default IconButton color (`MuiIconButton.defaultProps.color`) does not
reach the X.

## Why

WCAG 1.4.11 asks for 3:1 between a control's icon and its background. `grey[500]` on a white
dialog has 2.68:1; `action.active` has 4.6:1. The X now also matches FullFormDialog's
open-in-new button beside it, which has IconButton's default color.

## Migration

Nothing to do. Expect a darker X in screenshots of the light palette and a white one in the
dark palette.

- A theme that wants another color sets it in `CcDialogTitle.styleOverrides.closeButton`;
  check that it keeps 3:1 against the dialog's paper.
