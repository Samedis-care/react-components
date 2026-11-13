# BackendSingleSelect's switch comes with switchFilterName, which filters the options

- **Date:** 2026-11-13
- **Kind:** type
- **Scope:** `backend-components/Selector` (`BackendSingleSelect`, `FormBackendSingleSelect`,
  the theme's `CcBackendSingleSelect` default props), `ModelDataTypeBackendSingleSelectRenderer`,
  `GridSingleSelectFilterBackend`

## What changed

`BackendSingleSelect` has a new prop `switchFilterName`, as `BackendMultiSelect` has. With
it the field shows the switch above it, labelled `switchLabel` and starting at
`defaultSwitchValue`, and every search sends
`additionalFilters: { [switchFilterName]: <switch is on> }` to `model.index`, so toggling
the switch reloads the options with that filter.

`displaySwitch` is no longer a prop of `BackendSingleSelect` and the components built on
it: TypeScript rejects it. `switchLabel` and `defaultSwitchValue` stay.

`ModelDataTypeBackendSingleSelectRenderer` hands its props to the grid's ID filter of the
column too, so `switchFilterName` there also gives that filter the same switch.

## Why

`displaySwitch` showed a switch that did nothing: toggling it reloaded the same options,
because the search never sent the switch's position. The switch now exists only together
with the filter it sets.

## Migration

Required for code that passes `displaySwitch` to one of these components (it no longer
compiles): replace it with `switchFilterName`, the name of the backend filter the switch
sets, or drop it if there is nothing to filter. Pass `switchLabel` with it, it is the
switch's accessible name:

```tsx
<BackendSingleSelect
	model={model}
	modelToSelectorData={toOption}
	selected={selected}
	onSelect={setSelected}
	switchFilterName={"include_inactive"}
	switchLabel={t("show-inactive")}
/>
```
