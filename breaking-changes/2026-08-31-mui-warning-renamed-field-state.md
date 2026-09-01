# withMuiWarning is now withMuiFieldState

- **Date:** 2026-08-31
- **Kind:** type
- **Scope:** `standalone/UIKit`

## What changed

`src/standalone/UIKit/MuiWarning.tsx` is now `MuiFieldState.tsx`, and with it:

| before                              | after                            |
| ----------------------------------- | -------------------------------- |
| `withMuiWarning`                    | `withMuiFieldState`              |
| `MuiWarningSourceProps`             | `MuiFieldStateSourceProps`       |
| `MuiWarningResultProps`             | `MuiFieldStateProps`             |
| `UiKitTextFieldWithWarnings`        | `UiKitTextFieldWithState`        |
| `UiKitPickersTextFieldWithWarnings` | `UiKitPickersTextFieldWithState` |

Unchanged: `FormControlCC`, `FormControlFieldsetCC`, `FormLabelCC`, `FormHelperTextCC`,
`TextFieldCC`, `dirtyMarkerStyles`, `DirtyMarker`, `labelWithDirtyMarker`, the
`CcFieldState` and `CcDirtyMarker` theme slots, and the `warning` and `dirty` props
themselves. Everything is still re-exported from `standalone/UIKit`, so an import from the
package root or from `standalone` only needs the identifier renamed, not the path.

The three Storybook stories named `MuiWarningNormal`, `MuiWarningActive` and
`MuiWarningWithError` are now `FieldStateNormal`, `FieldStateWarning` and
`FieldStateWithError`, which changes their story URLs.

## Why

The HOC stopped being about warnings when the dirty state moved into it. It now applies
both of the field states this library adds on top of MUI's own error/required/disabled, and
the theme slot it registers was already called `CcFieldState` — the module name was the odd
one out.

## Migration

Rename the identifiers; the behaviour is identical. A deep import of the module path has to
move from `standalone/UIKit/MuiWarning` to `standalone/UIKit/MuiFieldState`.
