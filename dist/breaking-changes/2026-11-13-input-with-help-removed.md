# InputWithHelp and OutlinedInputWithHelp are removed

- **Date:** 2026-11-13
- **Kind:** type
- **Scope:** `standalone/UIKit`

## What changed

`InputWithHelp` and `OutlinedInputWithHelp` no longer exist. Neither was exported from the
package root, so they could only be imported from their deep paths
(`components-care/dist/standalone/UIKit/InputWithHelp` and `…/OutlinedInputWithHelp`).
Nothing in the library rendered them. `TextFieldWithHelp`, the field with a label, a Clear
button and an info button, is unchanged.

## Why

Both were unused, and both handled less than their props promised. They were typed with all
of `TextFieldWithHelp`'s props, but only `openInfo` (and `important` on `InputWithHelp`) had
an effect: `customHandleClear` and `disableClearable` reached the DOM as unknown attributes,
and `warning` and `dirty` changed nothing. An `endAdornment` passed by the caller replaced the
info button instead of sitting next to it.

## Migration

Nothing to do for samedis.care and identity-management, which never imported them. An app
that deep-imports one of them uses `TextFieldWithHelp` with `openInfo` for a labelled field,
or MUI's `Input` / `OutlinedInput` with the info button in its `endAdornment` for a bare one:

```tsx
import { IconButton, InputAdornment, OutlinedInput } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";

<OutlinedInput
	endAdornment={
		<InputAdornment position="end">
			<IconButton size="small" onClick={openInfo} aria-label={infoLabel}>
				<InfoIcon />
			</IconButton>
		</InputAdornment>
	}
/>;
```

`infoLabel` is the button's translated name, e.g. "More information".
