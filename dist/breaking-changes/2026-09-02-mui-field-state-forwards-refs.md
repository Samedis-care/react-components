# withMuiFieldState forwards refs

- **Date:** 2026-09-02
- **Kind:** behavior
- **Scope:** `standalone/UIKit`

## What changed

Every control wrapped in `withMuiFieldState` — `TextFieldCC`, `FormControlCC`,
`FormControlFieldsetCC`, `FormLabelCC`, `FormHelperTextCC`, the UI kit's text fields and
pickers text fields, and `BaseSelector`'s label — now hands a `ref` on to the MUI component
it wraps. It used to drop it.

Two things follow from that:

- React no longer logs `Function components cannot be given refs. Did you mean to use
  React.forwardRef()? Check the render method of CcFieldStateRoot` — which it did for every
  date and date/time input, since the pickers pass a ref to their text field.
- The pickers anchor their popup on that ref, so it now anchors on the field instead of
  falling back.

`warning` and `dirty` are still swallowed by the wrapper and never reach the DOM.

## Why

The wrapper rendered a plain function component inside `styled()`, which is where the ref
was lost. Anything asking a wrapped control for its element got nothing, and MUI's own
components pass refs around freely.

## Migration

Nothing to do, unless something depended on the ref staying empty. A ref passed to one of
these controls now resolves to the wrapped MUI component's root element — for
`TextFieldCC`, the `.MuiTextField-root` div, the same element the unwrapped `TextField`
would hand out.
