# SignaturePad's props type is `SignaturePadProps`, exported from the package root

- **Date:** 2026-11-27
- **Kind:** type
- **Scope:** `non-standalone/SignaturePad`, `standalone/SignPad`

## What changed

- SignaturePad's props type is named `SignaturePadProps`. It was `SignaturePadCanvasProps`,
  which only the module `non-standalone/SignaturePad/SignaturePad` exported. The package
  root exports `SignaturePadProps` next to `SignaturePad`.
- `SignPad`, `SignPadProps` and `SignPadClassKey` are exported from the package root too.

## Why

A props type is named after its component, and every public component and its props type
come from the package root, so a wrapper of the field imports both from `components-care`.

## Migration

**Required for** any app that imports `SignaturePadCanvasProps`: import `SignaturePadProps`
instead. TypeScript reports each old import.

```tsx
// before
import { SignaturePadCanvasProps } from "components-care/dist/non-standalone/SignaturePad/SignaturePad";
// after
import { SignaturePadProps } from "components-care";
```

Nothing else to do: the deep paths `components-care/dist/standalone/SignPad` and
`components-care/dist/non-standalone/SignaturePad/SignaturePad` keep working, and an app
that imports `SignPad` or `SignaturePad` from them can import them from `components-care`
instead.
