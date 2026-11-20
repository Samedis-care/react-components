# GroupBox's theme variants match smallLabel and label

- **Date:** 2026-11-20
- **Kind:** behavior, theme
- **Scope:** `standalone/GroupBox`, and what renders a GroupBox as its frame: FileUpload,
  ImageSelector, MultiImage, HowToBox, the files and image renderers

## What changed

`components.CcGroupBox.variants` match GroupBox's `smallLabel` and `label`, after the
theme's `defaultProps`; `smallLabel` counts as `false` when it is not set. They used to
match only the fieldset's HTML attributes (`disabled`, `aria-*`, …). A variant styles the
`<fieldset>`, and reaches the legend through a nested selector such as `"& > legend"`.

So, for a theme that sets `components.CcGroupBox.variants`:

- A variant keyed on `smallLabel` or `label` (`{ props: { smallLabel: true } }`) applies
  now. It never did.
- A variant whose `props` function tests `smallLabel` or `label`
  (`props: ({ smallLabel }) => !smallLabel`) matches only the GroupBoxes it describes. It
  used to match every GroupBox, since neither prop reached the function.

Nothing changes for a theme without `components.CcGroupBox.variants`.

## Why

MUI matches a component's theme `variants` against the props its root slot receives.
GroupBox's root received the fieldset's attributes but not `smallLabel` or `label`, so the
variants the theme types offered for them never applied. The root receives both now (they
do not reach the DOM).

## Migration

A theme that sets `components.CcGroupBox.variants` keyed on `smallLabel` or `label`, or
with a `props` function that reads either: check the frames, the variants take effect now.
To style the small legend from a variant, use a nested selector:

```ts
createTheme({
	components: {
		CcGroupBox: {
			variants: [
				{
					props: { smallLabel: true },
					style: { padding: 4, "& > legend": { paddingInline: 2 } },
				},
			],
		},
	},
});
```

A variant's `props` function gets GroupBox's props directly, there is no `ownerState`:
write `({ smallLabel }) => smallLabel`, not `({ ownerState }) => ownerState.smallLabel`.
