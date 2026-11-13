# DialogTitle with noTitle renders no heading; an untitled FullFormDialog is named by aria-label

- **Date:** 2026-11-13
- **Kind:** behavior, type
- **Scope:** `non-standalone/Dialog/DialogTitle`, `backend-components/Form/FormDialog` (FullFormDialog)

## What changed

- `DialogTitle` with `noTitle` renders no heading (the `text` slot, MUI's `DialogTitle`
  `h2`). Its children are rendered in the title row next to the close button, as plain
  content. The `id` prop and `classes.text` / `styleOverrides.text` apply only without
  `noTitle`. Without `noTitle` nothing changes.
- So DialogTitle with `noTitle` does not name the dialog. MUI's `Dialog` still points
  `aria-labelledby` at the title id, which no element has now, as in an MUI `Dialog`
  without `DialogTitle`.
- A FullFormDialog that shows no title (no `dialogTitle`, and none set through
  `FormDialogDispatch.setTitle`) has no heading and no accessible name unless it gets
  the new `aria-label` prop, which names it while it shows no title. A shown title names
  the dialog, as before.
- The open-in-new icon (`openInNewLink`) of a FullFormDialog without a title sits 1px
  higher, centered on the close button.

## Why

An untitled dialog was labelled by an empty `h2`: screen readers listed an empty heading,
axe reported `empty-heading`, and the dialog had no name all the same. The name is what
screen readers announce when the dialog opens, so it has to say what the dialog is for,
and for a dialog that shows no title only the app knows that.

## Migration

Required for every FullFormDialog that never shows a title (no `dialogTitle`, and its
content does not set one through `FormDialogDispatchContext.setTitle` or
`useSetFormDialogTitle`, e.g. a picker or an editor without a page layout): pass
`aria-label` with a translated name of what the dialog is for. Without it screen readers
announce only "dialog" when it opens, and axe reports `aria-dialog-name`.

```tsx
<FullFormDialog aria-label={t("users.pick-dialog")} onClose={onClose}>
	<UserPicker onSelect={onSelect} />
</FullFormDialog>
```

A FullFormDialog whose content sets the title can pass `aria-label` too: it names the
dialog while the content is still loading.

Required for a custom `CcFormDialog` renderer (`theme.components.CcFormDialog.defaultProps.renderer`)
that renders its own element with `role="dialog"` instead of `FormDialogDefaultRenderer`:
put `props["aria-label"]` on that element. Without it the name is lost in that layout.
A renderer that passes its props on to `FormDialogDefaultRenderer` needs nothing.

For a `DialogTitle noTitle` rendered directly in a `Dialog`: name the `Dialog` the way MUI
documents for a dialog without `DialogTitle`, with `aria-labelledby` pointing at a heading
in its content, or with `slotProps={{ paper: { "aria-label": … } }}`.
