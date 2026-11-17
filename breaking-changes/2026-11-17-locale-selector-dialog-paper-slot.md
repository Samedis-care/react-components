# LocaleSelectorDialog's visible box is the paper slot

- **Date:** 2026-11-17
- **Kind:** theme
- **Scope:** `non-standalone/LocaleSelector`

## What changed

`LocaleSelectorDialog` has a `paper` slot: the visible box, MUI's Dialog paper
(`.MuiDialog-paper`, the element with role `dialog`). `classes.paper` and the theme's
`components.CcLocaleSelectorDialog.styleOverrides.paper` land on it, and it carries the
400px width itself:

```ts
CcLocaleSelectorDialog: {
	styleOverrides: { paper: { width: 600 } },
},
```

The width used to be a rule of the `root` slot on its descendant `.MuiPaper-root`, from
the `sm` breakpoint up. As on every MUI Dialog, MUI's paper styles come after the slot's,
including the theme's `MuiDialog.styleOverrides.paper`: a width set there now applies to
this dialog too, where the `root` rule used to keep it at 400px. Below `sm` the dialog
stays full screen, whatever width the slot sets.

## Why

The box could be styled only through a descendant selector on the full-screen Modal root,
which `className` and `classes.root` also land on.

## Migration

Nothing to do for IMF: its `MuiDialog` paper rule applies below `sm` only, where the
dialog is full screen as before. Nothing to do for SCF either: its `MuiDialog` paper rule
(`@media (max-width: 600px)`) also matches a window exactly 600px wide, where the box now
takes the width that rule gives SCF's other dialogs instead of 400px.

A theme that styles the box through `root` with `"& .MuiPaper-root"`: move those styles to
`paper`. A theme that sets a width in `MuiDialog.styleOverrides.paper` for every dialog and
wants this one narrower: set it in `paper` with doubled specificity, e.g.
`paper: { "&&": { width: 400 } }`.
