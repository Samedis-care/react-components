# InlineSwitch has no top margin

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/InlineSwitch` rendered by an app itself; the selectors, which
  removed the margin already, look the same

## What changed

InlineSwitch's root has no margin. Before, it had a 15px top margin, also with the
switch hidden and without children.

## Why

A component puts no space around itself, as MUI's components do not: the surrounding
layout spaces it. The selectors, which render the library's InlineSwitches, set the
margin back to 0 anyway.

## Migration

Nothing changes for the selectors. Required for any app that renders an InlineSwitch
itself and wants the space above it: add the margin where it is used,

```tsx
const SpacedInlineSwitch = styled(InlineSwitch)({ marginTop: 15 });
```

or for every InlineSwitch in the theme:

```ts
createTheme({
	components: {
		CcInlineSwitch: { styleOverrides: { root: { marginTop: 15 } } },
	},
});
```
