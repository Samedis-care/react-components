# SignaturePad's className, classes and canvasProps reach the element they name

- **Date:** 2026-11-27
- **Kind:** behavior, type
- **Scope:** `non-standalone/SignaturePad`, `non-standalone/Dialog/SignPadDialog` (`SignDialog`)

## What changed

- `className` and `classes` given to SignaturePad style the tile, as SignPad's do: the
  root and the slots `button`, `signTextDiv`, `imageDiv`, `signPreview` and `infoDiv`.
  Before, they went to the open dialog: `className` and `classes.root` to its MUI Dialog
  root, `classes.imageDiv` to the box of the stored signature.
- `canvasProps` given to SignaturePad or SignDialog reach the drawing canvas. They are
  spread over the canvas's own `role="img"` and name "Signature area", so an `aria-label`
  there replaces that name. Before, SignaturePad ignored them and SignDialog had no such
  prop. Their type no longer takes `width` and `height`: the canvas fills the sign area.
- `SignaturePadCanvasProps` no longer has `clearOnResize` and `openSignPad`. Neither had
  an effect: the drawn ink is redrawn when the sign area changes size, and SignaturePad
  opens its own dialog.

## Why

The props type offered the tile's class keys, but the classes reached the dialog, and two
documented props did nothing.

## Migration

Nothing to do for an app that passes none of these props: the field looks and works as
before.

**Required for** any app that passes `className` or `classes` to a SignaturePad to style
its dialog: they now style the tile. Give them to the dialog through the
`CcSignPadDialog` default props of a theme around the field (the dialog renders inside the
field's contexts); its class keys are `root`, `dialogTitle`, `closeButton`,
`instructions`, `signDiv`, `imageDiv`, `signatureImage` and `hiddenDiv`:

```tsx
// the app's theme, with a class for the sign dialog
const withSignDialogClass = (outer: Theme): Theme => ({
	...outer,
	components: {
		...outer.components,
		CcSignPadDialog: { defaultProps: { className: "my-sign-dialog" } },
	},
});

<ThemeProvider theme={withSignDialogClass}>
	<SignaturePad signature={value} setSignature={setValue} />
</ThemeProvider>;
```

**Required for** any app that passes `clearOnResize` or `openSignPad` to a SignaturePad, or
`width` or `height` in its `canvasProps`: remove them; TypeScript reports each one.
