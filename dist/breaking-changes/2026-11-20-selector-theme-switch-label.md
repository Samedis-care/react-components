# A theme that shows a selector's switch must set switchLabel

- **Date:** 2026-11-20
- **Kind:** type
- **Scope:** the theme's `defaultProps` of the selectors with a switch: `CcBaseSelector`, `CcMultiSelect`, `CcMultiSelectWithoutGroup`, `CcMultiSelectWithTags` (`displaySwitch`), `CcBackendSingleSelect`, `CcBackendMultiSelect`, `CcBackendMultipleSelect`, `CcGridSingleSelectFilterBackend`, `CcGridMultiSelectFilterBackend` (`switchFilterName`) and `CcBackendMultiSelectWithTags` (`switchFilterNameGroup`, `switchFilterNameData`)

## What changed

The `defaultProps` of these theme entries keep `switchLabel` required while they show the
switch, as the selectors' own props already do: a theme that sets `displaySwitch: true`, a
`switchFilterName`, `switchFilterNameGroup` or `switchFilterNameData` without `switchLabel` no
longer compiles. Every other default stays optional, `switchLabel` can still be set on its own,
and a `variants` entry can still match `{ displaySwitch: true }`.

Nothing changes at runtime or visually.

## Why

`switchLabel` is the switch's visible text and its only accessible name. A theme default that
turned the switch on without it compiled and rendered an unnamed switch in every such selector
of the app, announced as "switch, off" with no purpose (WCAG 4.1.2 Name, Role, Value), which the
selectors' props already rule out.

## Migration

Required for a theme whose `defaultProps` show a selector's switch without `switchLabel`: add
the label next to the prop that turns the switch on, or pass both at the call sites instead.

```ts
createTheme({
	components: {
		CcBaseSelector: {
			defaultProps: { displaySwitch: true, switchLabel: "Show inactive" },
		},
		CcBackendSingleSelect: {
			defaultProps: {
				switchFilterName: "include_inactive",
				switchLabel: "Show inactive",
			},
		},
	},
});
```

Without it the theme no longer compiles (`switchLabel` is missing). Nothing to do for a theme
that does not set these props.
