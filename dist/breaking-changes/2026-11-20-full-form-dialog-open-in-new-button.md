# FullFormDialog's open-in-new action is a named button beside the close button

- **Date:** 2026-11-20
- **Kind:** behavior, theme
- **Scope:** `backend-components/Form/FormDialog` (FullFormDialog and
  `FormDialogDefaultRenderer`), `non-standalone/Dialog/DialogTitle`

## What changed

- With `openInNewLink`, or a link set through `FormDialogDispatch.setOpenInNewLink`, the
  default renderer shows an icon button named "Open in new tab" (key
  `backend-components.form.form-dialog.open-in-new-tab`, in every locale) in the title row,
  after the title and before the close button. Before, the open-in-new icon followed the
  title text inside the heading.
- The button is in the tab order before the close button, and Enter or Space activates it.
  While it has keyboard focus it shows a focus ring: a 2px outline in
  `palette.primary.main`, or the theme's `focusVisible` ring when the theme sets one.
- It has the size of the close button (32px) and MUI's default `IconButton` color
  (`palette.action.active`); the icon used to be in the title's color.
- The link is called without arguments. Before, a click passed the click event to it.
- A long title no longer pushes the action out of the dialog: the title gives way, the
  button stays beside the close button.
- Theme: the new slot `openInNewButton` of `components.CcFormDialog.styleOverrides` is the
  button. `openInNewIcon` is now the icon inside it, and no longer has its own
  `verticalAlign`, `cursor` and `marginLeft`.
- `DialogTitle` has a new prop `action`: controls shown in the title row after the heading
  and before the close button, outside the heading, so they are not part of the dialog's
  name. Its box is the slot `action` (`classes.action`, `styleOverrides.action` of
  `components.CcDialogTitle`). FullFormDialog puts the button there.

## Why

The icon was an `svg` hidden from assistive technology, with a click handler, inside the
heading. Tab never reached it and screen readers did not see it, so keyboard and
screen-reader users could not open the record in a new tab, and a long title pushed it out
of view.

## Migration

Nothing to do for a dialog that passes `openInNewLink`: it now shows the button, also when an
app's renderer renders `FormDialogDefaultRenderer`.

Required for an app whose theme places or sizes the icon through
`components.CcFormDialog.styleOverrides.openInNewIcon` (a margin, a cursor): those styles
now apply to the icon inside the button. Move them to `openInNewButton`:

```ts
CcFormDialog: {
	styleOverrides: {
		// was: openInNewIcon: { marginLeft: 4 }
		openInNewButton: { marginLeft: 4 },
	},
},
```

Expect the button beside the close button in screenshots of dialogs with an open-in-new
link.
