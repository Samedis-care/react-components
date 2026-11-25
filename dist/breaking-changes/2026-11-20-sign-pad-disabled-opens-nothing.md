# A disabled SignPad tile opens nothing

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/SignPad`, and through it `non-standalone/SignaturePad` and the
  form renderer of `TypeSignature`

## What changed

- While `disabled`, the SignPad tile no longer calls `openSignPad`: not on a click, and not
  on Enter or Space on its button. The tile shows the default cursor instead of a pointer.
  The info button keeps working (`openInfo` is still called).
- While disabled, the tile's root has the class `CcSignPad-disabled`, so a theme can style
  the state: `root: { "&.CcSignPad-disabled": { … } }` in
  `components.CcSignPad.styleOverrides`.
- `disabled: true` in the theme's `components.CcSignPad.defaultProps` disables every tile
  this way, SignaturePad's included: SignaturePad no longer opens its sign dialog from such a
  tile. Before, the theme default only greyed the pen icon, and SignaturePad opened the
  dialog anyway. A `disabled={false}` passed to SignaturePad or SignPad still wins over the
  theme default.

## Why

`disabled` greyed the pen icon and marked the button `aria-disabled`, but a click still
called `openSignPad` under a pointer cursor, so an app that used the tile directly got a
tile that looked disabled and still opened its dialog. The tile now decides what is
disabled for SignaturePad as well, so the tile's look and SignaturePad's dialog follow the
same value.

## Migration

Nothing to do for SCF and IMF: neither renders SignPad itself or sets
`components.CcSignPad.defaultProps.disabled`.

Required for an app that renders SignPad with `disabled` and relies on `openSignPad` being
called anyway (e.g. to show a read-only signature enlarged): without a change, the click
does nothing. Leave `disabled` off for such a tile and decide in `openSignPad` what to open:

```tsx
<SignPad
	signature={signature}
	// was: disabled={readOnly} with openSignPad={readOnly ? showLarge : edit}
	openSignPad={readOnly ? showLarge : edit}
/>
```

An app that sets `disabled: true` in `components.CcSignPad.defaultProps` and expects its
signature fields to stay editable must pass `disabled={false}` to those fields.
