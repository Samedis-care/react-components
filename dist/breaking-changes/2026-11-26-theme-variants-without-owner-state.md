# Theme variants of most CC components get no ownerState, and match only what their root receives

- **Date:** 2026-11-26
- **Kind:** type, theme
- **Scope:** `theme-def`: `components.<CcName>.variants` of the components listed below

## What changed

A variant's `props` of the following theme components is typed with the props the
component's root receives. A `props` function gets them directly: reading `ownerState` in
it is a type error. A `props` object or function that names another prop is a type error
too:

- `CcSmallIconButton`, `CcSmallestIconButton`, `CcSmallListItem`, `CcSmallListItemButton`,
  `CcSelectorSmallListItem`, `CcSelectorSmallListItemButton`, `CcSmallListItemIcon`,
  `CcUiKitInput`, `CcUiKitInputOutlined`, `CcUiKitTextField`: every prop
- `CcLoader`: every prop but `className`, `classes`, `aria-label` and `aria-labelledby`
- `CcVerticalDivider`: every prop but `className`
- `CcCountryFlag`: every prop but `className`, `classes` and `style`
- `CcGroupBox`: every prop but `children`, `className` and `classes`
- `CcPageTitle`: every prop but `disableAutoTitle`
- `CcPopupMenu`: every prop but `slotProps`
- `CcFileUpload`: `smallLabel`
- `CcImagePreviewDialog`: `open` and `onClose`
- `CcMenuItemMaterial`, `CcMenuItemJumboReactLight`, `CcMenuItemJumboReactDark`: the menu
  entry's `onClick` and `onAuxClick` (they were typed with `typographyProps`, which never
  reaches the root)
- `CcLocaleSelectorEntry`: `disabled` and `className`
- `CcWeekView`: `className`

The following theme components have no `variants` any more:

- Their root receives none of their props: `CcMultiGrid`, `CcFormPageLayout`,
  `CcDialogTitle`, `CcSignPad`, `CcSignPadDialog`, `CcMatrixGrid`, `CcMatrixCellTile`,
  `CcImageDots`, `CcImageDialogEntry`, `CcMultiImage`, `CcCollapsibleMenu`, `CcPortalMenu`,
  `CcLocaleSelectorDialog`, `CcMultiSelectWithTags`, `CcScrollableScheduleDay`, `CcDataGrid`
- They have no root slot: `CcDefaultFormPageButtons`, `CcFormDialog`, `CcCrudLoadStatus`,
  `CcFile`, `CcImageSelector`, `CcPortalLayoutMenu`, `CcLocaleSelectorDialogContent`,
  `CcMultiSelectWithoutGroup`, `CcWeekViewDay`, `CcScrollableSchedule`,
  `CcGridMultiSelectFilter`, `CcGridMultiSelectFilterBackend`, `CcGridSingleSelectFilter`,
  `CcGridSingleSelectFilterBackend`

Nothing changes at runtime.

## Why

MUI applies a component's theme `variants` to its root slot only. It matches a `props`
object against the props that slot receives, and calls a `props` function with those props
and the slot's `ownerState`. None of these components passes an `ownerState` to its root, so
a function that read one (`({ ownerState }) => ownerState.smallLabel`) compiled, threw
while the component was styled, and crashed every instance. A variant keyed on a prop the
root does not receive never matched, and the variants of a component without a root slot
never applied. The types now offer what the roots receive.

## Migration

Required for a theme with a variant `props` function on one of the components above that
reads `ownerState`: it no longer compiles, and it threw on the first render. Read the props
directly:

```ts
createTheme({
	components: {
		CcGroupBox: {
			variants: [
				{
					// was: props: ({ ownerState }) => ownerState.smallLabel,
					props: ({ smallLabel }) => smallLabel === true,
					style: { padding: 4 },
				},
			],
		},
	},
});
```

Required for a theme with `variants` on one of the components that no longer have them, or
with a variant that names a prop its root does not receive: it no longer compiles. Such a
variant never matched. Style the component's states through its state classes instead,
e.g. a disabled SignPad:

```ts
createTheme({
	components: {
		CcSignPad: {
			// was: variants: [{ props: { disabled: true }, style: { opacity: 0.5 } }]
			styleOverrides: { root: { "&.CcSignPad-disabled": { opacity: 0.5 } } },
		},
	},
});
```

A variant that matched every instance (`props: {}`) of a component that has a root slot
styled the root as `styleOverrides.root` does: move its style there. A theme without
`variants` on these components, or with variants that name only the props listed above,
needs nothing.
