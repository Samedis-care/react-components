# Theme style override functions of most CC components get no ownerState

- **Date:** 2026-11-17
- **Kind:** type, theme
- **Scope:** `theme-def`: `components.<CcName>.styleOverrides` of the components listed below

## What changed

A function in `styleOverrides` of the following theme components is typed as receiving
`{ theme }`. Reading `ownerState` in it is a type error:

- Layout and forms: `CcLoader`, `CcFormPageLayout`, `CcDefaultFormPageButtons`, `CcForm`,
  `CcFormDialog`, `CcFlowEngine`, `CcCrud`, `CcCrudLoadStatus`, `CcPageTitle`,
  `CcRoutedTabs`, `CcDialogTitle`, `CcSignPad`, `CcSignPadDialog`
- Inputs: `CcUiKitInput`, `CcUiKitInputOutlined`, `CcUiKitTextField`, `CcFieldState`,
  `CcDirtyMarker`, `CcCountryFlag`, `CcMultiSelectWithTags`, `CcMultiSelectWithoutGroup`
- DataGrid: `CcDataGrid`, `CcGridMultiSelectFilter`, `CcGridMultiSelectFilterBackend`,
  `CcGridSingleSelectFilter`, `CcGridSingleSelectFilterBackend`,
  `CcBackendDataGridMultiSelect`, `CcFilesGrid`, `CcMultiGrid`
- Files and images: `CcFileUpload`, `CcFile`, `CcImageSelector`, `CcImagePreviewDialog`,
  `CcMultiImage`, `CcImageDots`, `CcImageDialogEntry`
- Portal and menus: `CcPortalMenu`, `CcPortalLayoutMenu`, `CcCollapsibleMenu`,
  `CcMenuItemMaterial`, `CcMenuItemJumboReactLight`, `CcMenuItemJumboReactDark`,
  `CcLocaleSelectorDialog`, `CcLocaleSelectorDialogContent`, `CcLocaleSelectorEntry`
- Matrix and schedules: `CcMatrixGrid`, `CcMatrixCellTile`, `CcWeekView`, `CcWeekViewDay`,
  `CcScrollableSchedule`, `CcScrollableScheduleDay`

Nothing changes at runtime.

## Why

None of these components passes an `ownerState` to its slots, and MUI calls every
function in a component's `styleOverrides` while styling each of its slots. A theme
function that read a property of `ownerState` (`ownerState.status`, …) compiled, threw while
the component was styled, and crashed every instance of the component. The types now
match what the functions receive.

## Migration

Required for a theme with a function in `styleOverrides` of one of the components above
that reads `ownerState`: it no longer compiles, and it threw on the first render before.
Read only `theme` in the function, and style the component's states through its state
classes, e.g. a selected DataGrid cell:

```ts
createTheme({
	components: {
		CcDataGrid: {
			styleOverrides: {
				// was: cell: ({ ownerState }) => ({ … })
				cell: ({ theme }) => ({
					"&.CcDataGrid-dataCellSelected": {
						backgroundColor: theme.palette.action.selected,
					},
				}),
			},
		},
	},
});
```

A theme with plain style objects, or with functions that read only `theme` (as the apps'
themes do), needs nothing.
