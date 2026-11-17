import { describe, expect, it } from "vitest";
import { createTheme, Theme } from "@mui/material";
import type {} from "../src/theme-def";

/** the style override functions of every slot of every component in the theme */
const overrideFunctions = (theme: Theme) =>
	Object.values(theme.components ?? {}).flatMap((component) =>
		Object.values(
			(component as { styleOverrides?: Record<string, unknown> })
				.styleOverrides ?? {},
		),
	);

describe("theme-def", () => {
	it("[ISSUE-3462-ITEM-17] types function styleOverrides without an ownerState for the components whose slots receive none", () => {
		// MUI calls every function of a component's styleOverrides while styling each of its
		// slots, so reading an ownerState that no slot receives would throw on every render
		const theme = createTheme({
			components: {
				CcLoader: {
					styleOverrides: {
						// @ts-expect-error no slot of Loader receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcMultiGrid: {
					styleOverrides: {
						// @ts-expect-error no slot of MultiGrid receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcCountryFlag: {
					styleOverrides: {
						// @ts-expect-error no slot of CountryFlag receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcDefaultFormPageButtons: {
					styleOverrides: {
						// @ts-expect-error no slot of DefaultFormPageButtons receives an ownerState
						backButton: ({ ownerState }) => ({
							color: ownerState ? "red" : "blue",
						}),
					},
				},
				CcMatrixGrid: {
					styleOverrides: {
						// @ts-expect-error no slot of MatrixGrid receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcMatrixCellTile: {
					styleOverrides: {
						// @ts-expect-error no slot of MatrixCellTile receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcFormPageLayout: {
					styleOverrides: {
						// @ts-expect-error no slot of FormPageLayout receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcBackendDataGridMultiSelect: {
					styleOverrides: {
						// @ts-expect-error no slot of BackendDataGridMultiSelect receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcImageDots: {
					styleOverrides: {
						// @ts-expect-error no slot of ImageDots receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcImageDialogEntry: {
					styleOverrides: {
						// @ts-expect-error no slot of ImageDialogEntry receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcCollapsibleMenu: {
					styleOverrides: {
						// @ts-expect-error no slot of CollapsibleMenu receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcMultiImage: {
					styleOverrides: {
						// @ts-expect-error no slot of MultiImage receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcPortalLayoutMenu: {
					styleOverrides: {
						// @ts-expect-error no slot of the portal layout's menu receives an ownerState
						menuPaper: ({ ownerState }) => ({
							color: ownerState ? "red" : "blue",
						}),
					},
				},
				CcSignPadDialog: {
					styleOverrides: {
						// @ts-expect-error no slot of SignPadDialog receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcMenuItemJumboReactLight: {
					styleOverrides: {
						// @ts-expect-error no slot of the light Jumbo menu item receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcMenuItemJumboReactDark: {
					styleOverrides: {
						// @ts-expect-error no slot of the dark Jumbo menu item receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcFile: {
					styleOverrides: {
						// @ts-expect-error no slot of File receives an ownerState
						label: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcDialogTitle: {
					styleOverrides: {
						// @ts-expect-error no slot of DialogTitle receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcFileUpload: {
					styleOverrides: {
						// @ts-expect-error no slot of FileUpload receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcCrudLoadStatus: {
					styleOverrides: {
						// @ts-expect-error no slot of CrudLoadStatus receives an ownerState
						message: ({ ownerState }) => ({
							color: ownerState ? "red" : "blue",
						}),
					},
				},
				CcImageSelector: {
					styleOverrides: {
						// @ts-expect-error no slot of ImageSelector receives an ownerState
						rootModern: ({ ownerState }) => ({
							color: ownerState ? "red" : "blue",
						}),
					},
				},
				CcImagePreviewDialog: {
					styleOverrides: {
						// @ts-expect-error no slot of ImagePreviewDialog receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcPortalMenu: {
					styleOverrides: {
						// @ts-expect-error no slot of PortalMenu receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcMenuItemMaterial: {
					styleOverrides: {
						// @ts-expect-error no slot of the Material menu item receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcUiKitInput: {
					styleOverrides: {
						// @ts-expect-error no slot of UiKitInput receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcUiKitInputOutlined: {
					styleOverrides: {
						// @ts-expect-error no slot of UiKitInputOutlined receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcUiKitTextField: {
					styleOverrides: {
						// @ts-expect-error no slot of UiKitTextField receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcLocaleSelectorDialog: {
					styleOverrides: {
						// @ts-expect-error no slot of LocaleSelectorDialog receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcLocaleSelectorDialogContent: {
					styleOverrides: {
						// @ts-expect-error no slot of LocaleSelectorDialogContent receives an ownerState
						localeList: ({ ownerState }) => ({
							color: ownerState ? "red" : "blue",
						}),
					},
				},
				CcLocaleSelectorEntry: {
					styleOverrides: {
						// @ts-expect-error no slot of LocaleSelectorEntry receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcSignPad: {
					styleOverrides: {
						// @ts-expect-error no slot of SignPad receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcFormDialog: {
					styleOverrides: {
						// @ts-expect-error no slot of FormDialog receives an ownerState
						content: ({ ownerState }) => ({
							color: ownerState ? "red" : "blue",
						}),
					},
				},
				CcPageTitle: {
					styleOverrides: {
						// @ts-expect-error no slot of PageTitle receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcFilesGrid: {
					styleOverrides: {
						// @ts-expect-error no slot of the files cell receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcMultiSelectWithTags: {
					styleOverrides: {
						// @ts-expect-error no slot of MultiSelectWithTags receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcMultiSelectWithoutGroup: {
					styleOverrides: {
						// @ts-expect-error no slot of MultiSelectWithoutGroup receives an ownerState
						switch: ({ ownerState }) => ({
							color: ownerState ? "red" : "blue",
						}),
					},
				},
				CcWeekViewDay: {
					styleOverrides: {
						// @ts-expect-error no slot of WeekViewDay receives an ownerState
						paper: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcScrollableSchedule: {
					styleOverrides: {
						// @ts-expect-error no slot of ScrollableSchedule receives an ownerState
						scroller: ({ ownerState }) => ({
							color: ownerState ? "red" : "blue",
						}),
					},
				},
				CcScrollableScheduleDay: {
					styleOverrides: {
						// @ts-expect-error no slot of ScrollableScheduleDay receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcWeekView: {
					styleOverrides: {
						// @ts-expect-error no slot of WeekView receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcDataGrid: {
					styleOverrides: {
						// @ts-expect-error no slot of DataGrid receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcGridMultiSelectFilter: {
					styleOverrides: {
						// @ts-expect-error no slot of GridMultiSelectFilter receives an ownerState
						dialogRoot: ({ ownerState }) => ({
							color: ownerState ? "red" : "blue",
						}),
					},
				},
				CcGridMultiSelectFilterBackend: {
					styleOverrides: {
						// @ts-expect-error no slot of GridMultiSelectFilterBackend receives an ownerState
						dialogRoot: ({ ownerState }) => ({
							color: ownerState ? "red" : "blue",
						}),
					},
				},
				CcGridSingleSelectFilter: {
					styleOverrides: {
						// @ts-expect-error no slot of GridSingleSelectFilter receives an ownerState
						dialogRoot: ({ ownerState }) => ({
							color: ownerState ? "red" : "blue",
						}),
					},
				},
				CcGridSingleSelectFilterBackend: {
					styleOverrides: {
						// @ts-expect-error no slot of GridSingleSelectFilterBackend receives an ownerState
						dialogRoot: ({ ownerState }) => ({
							color: ownerState ? "red" : "blue",
						}),
					},
				},
				CcForm: {
					styleOverrides: {
						// @ts-expect-error no slot of Form receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcFieldState: {
					styleOverrides: {
						// @ts-expect-error no slot of a field state wrapper receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcDirtyMarker: {
					styleOverrides: {
						// @ts-expect-error no slot of the dirty marker receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcFlowEngine: {
					styleOverrides: {
						// @ts-expect-error no slot of FlowEngine receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcCrud: {
					styleOverrides: {
						// @ts-expect-error no slot of CRUD receives an ownerState
						gridWrapper: ({ ownerState }) => ({
							color: ownerState ? "red" : "blue",
						}),
					},
				},
				CcRoutedTabs: {
					styleOverrides: {
						// @ts-expect-error no slot of RoutedTabs receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
			},
		});
		expect(overrideFunctions(theme)).toEqual(
			Array(51).fill(expect.any(Function)),
		);
	});

	it("[ISSUE-3462-ITEM-17] keeps ownerState in the function styleOverrides of the components whose every slot receives one", () => {
		// each of these has a single slot, and it is rendered with an ownerState
		const theme = createTheme({
			components: {
				CcActionButton: {
					styleOverrides: {
						button: ({ ownerState }) => ({
							color: ownerState.color ? "red" : "blue",
						}),
					},
				},
				CcSubActionButton: {
					styleOverrides: {
						button: ({ ownerState }) => ({
							color: ownerState.small ? "red" : "blue",
						}),
					},
				},
				CcPortalLayout: {
					styleOverrides: {
						container: ({ ownerState }) => ({
							color: ownerState.mobile ? "red" : "blue",
						}),
					},
				},
				CcDayContents: {
					styleOverrides: {
						button: ({ ownerState }) => ({
							color: ownerState.altBorder ? "red" : "blue",
						}),
					},
				},
			},
		});
		expect(overrideFunctions(theme)).toEqual(
			Array(4).fill(expect.any(Function)),
		);
	});
});
