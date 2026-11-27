# FullFormDialog's content keeps a top padding, with or without a title

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `backend-components/Form/FormDialog` (`FullFormDialog`, `FormDialogDefaultRenderer`, and custom renderers that render it)

## What changed

The content of a FullFormDialog has a top padding of `theme.spacing(2)` (16px by default),
with and without a title, also with `useCustomClasses`. Before, it had none: MUI's
`DialogContent` drops its top padding right after a title, and `DialogTitle`'s row did the
same with `noTitle`, so without a title the content started at the dialog's top edge.

The content now starts 16px lower: the dialog is 16px taller, or, when it is already as tall
as the screen allows, its content scrolls 16px further.

The padding is set with four classes (`&&&&`), which outrank `DialogTitle`'s rule. A theme
whose `components.CcFormDialog.styleOverrides.content` (the content with `useCustomClasses`)
sets `padding` keeps its side and bottom padding there; the top padding stays 16px.

## Why

The floating label of an outlined field sits 9px above the field, and the content scrolls, so
it cuts off what lies above its top edge. In a form whose first row holds outlined fields with
a value, the upper half of their labels ("First Name \*") was cut off and could not be read.

## Migration

Nothing is required. Expect the content 16px lower in screenshots of form dialogs.

Optional: content that adds its own top padding inside a FullFormDialog to keep the labels
visible (a box with padding around the form) can drop it; with it, the space above the first
row doubles. A theme that wants another top padding sets it under `"&&&&"` in
`components.CcFormDialog.styleOverrides.content`, which reaches only the content with
`useCustomClasses`.
