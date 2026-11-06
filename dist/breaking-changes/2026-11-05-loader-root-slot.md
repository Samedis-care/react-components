# The Loader's outer slot is `root`, and theme variants apply to it

- **Date:** 2026-11-05
- **Kind:** type, behavior
- **Scope:** `standalone/Loader`

## What changed

- The Loader's outermost box is the theme slot `root`. It was `outerWrapper`.
  `LoaderClassKey` has `"root"` in place of `"outerWrapper"`, so
  `components.CcLoader.styleOverrides.outerWrapper` is a type error and is no longer
  applied.
- `components.CcLoader.variants` apply now, to the `root` slot. They used to be ignored.
  A variant's `props` match the Loader's `text` and `typographyVariant` after the theme's
  `defaultProps`; `typographyVariant` counts as `"h6"` when it is not set.
- `typographyVariant` takes every variant MUI's `Typography` takes, so `"inherit"` and
  the variants a theme adds through `TypographyPropsVariantOverrides` are no longer type
  errors.

## Why

MUI applies a component's theme `variants` only to its `root` slot, matched against the
props that slot receives. The Loader had no `root` slot, so its typed `variants` entry had
no effect.

## Migration

Required for a theme that sets `components.CcLoader.styleOverrides.outerWrapper`: rename
the key to `root`. Without it the theme does not compile, and the override is not applied.

```ts
createTheme({
	components: {
		CcLoader: {
			styleOverrides: {
				// was outerWrapper: { padding: 8 }
				root: { padding: 8 },
			},
		},
	},
});
```

A theme that sets `components.CcLoader.variants`: they style the Loader's outer box now,
so check that they look as intended. Nothing else to do.
