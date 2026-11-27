# FormCrudMultiSelect's module no longer exports ForwardedCrudMultiSelect

- **Date:** 2026-11-27
- **Kind:** type
- **Scope:** `backend-components/Form/CrudControls/FormCrudMultiSelect`

## What changed

`components-care/dist/backend-components/Form/CrudControls/FormCrudMultiSelect` no longer
exports `ForwardedCrudMultiSelect`, the control without `React.memo`. Its default export,
which the package root exports as `FormCrudMultiSelect`, stays as it is.

## Why

The library's components are wrapped in `React.memo`. `ForwardedCrudMultiSelect` was the
control without it, reachable only through that deep path: it rendered again with every
render of its parent. It also had the name of CrudMultiSelect's own forwardRef.

## Migration

- **Required for code that imports `ForwardedCrudMultiSelect` from that module:** import
  `FormCrudMultiSelect` from `components-care` instead. It takes the same props and ref:

  ```tsx
  import { FormCrudMultiSelect } from "components-care";
  ```
