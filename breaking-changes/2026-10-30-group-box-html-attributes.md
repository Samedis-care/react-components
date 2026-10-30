# GroupBox takes any fieldset attribute; FileUpload and MultiImage pass them on through slotProps

- **Date:** 2026-10-30
- **Kind:** type
- **Scope:** `standalone/GroupBox`, `standalone/FileUpload`, `backend-components/FileUpload`

## What changed

- `GroupBox` sets every HTML attribute it does not take itself on its fieldset. Its
  `busy` prop is gone: pass `aria-busy` instead.
- `FileUpload` and `MultiImage` take `slotProps`, as MUI components do: `slotProps.root`
  of FileUpload and `slotProps.groupBox` of MultiImage hold HTML attributes for the
  field's frame. FileUpload adds `slotProps.root.className` to its `className` and
  `classes.root`, and a custom FileUpload variant gets `slotProps` as well. Their `busy`
  prop stays: while it is true, the frame is `aria-busy` whatever `slotProps` says.
- CrudFileUpload and CrudMultiImage take the same `slotProps`. They add the id of a write
  error shown next to the field to the `aria-describedby` passed in.
- `GroupBoxProps`, `GroupBoxHTMLProps` and `GroupBoxClassKey` are exported from the
  package root.

## Why

A prop for each attribute covered only what the library needed itself. Any other
attribute, like an `id` or a description of the consumer's own, could not be set on the
frame.

## Migration

`<GroupBox busy={busy}>` becomes `<GroupBox aria-busy={busy}>`.
