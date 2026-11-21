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
				CcFormButtons: {
					styleOverrides: {
						// @ts-expect-error no slot of FormButtons receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcCenteredTypography: {
					styleOverrides: {
						// @ts-expect-error no slot of CenteredTypography receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcCheckbox: {
					styleOverrides: {
						// @ts-expect-error no slot of Checkbox receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcComponentWithLabel: {
					styleOverrides: {
						// @ts-expect-error no slot of ComponentWithLabel receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
			},
		});
		expect(overrideFunctions(theme)).toEqual(
			Array(55).fill(expect.any(Function)),
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

	it("[ISSUE-3482-ITEM-15] types the ownerState of CcActionButton and CcSubActionButton as the flags their button slot gets", () => {
		const theme = createTheme({
			components: {
				CcActionButton: {
					styleOverrides: {
						button: ({ ownerState }) => {
							// whether small and color are set, not the props themselves
							const flags: { small: boolean; color: boolean } = ownerState;
							// @ts-expect-error the ownerState holds small and color only
							const disabled: unknown = ownerState.disabled;
							return { color: flags.color || disabled ? "red" : "blue" };
						},
					},
				},
				CcSubActionButton: {
					styleOverrides: {
						button: ({ ownerState }) => {
							const flags: { small: boolean; disableDivider: boolean } =
								ownerState;
							// @ts-expect-error the ownerState holds small and disableDivider only
							const disabled: unknown = ownerState.disabled;
							return {
								color: flags.disableDivider || disabled ? "red" : "blue",
							};
						},
					},
				},
			},
		});
		expect(overrideFunctions(theme)).toEqual(
			Array(2).fill(expect.any(Function)),
		);
	});

	it("[ISSUE-3482-ITEM-15] types the variants of the UIKit components as what their slots match", () => {
		const variants = (theme: Theme) =>
			Object.values(theme.components ?? {}).flatMap(
				(component) => (component as { variants?: unknown[] }).variants ?? [],
			);
		const theme = createTheme({
			components: {
				CcActionButton: {
					variants: [
						// the button's props, and small and color as booleans from the ownerState
						{ props: { color: "error", small: true }, style: {} },
						{ props: { disabled: true, fullWidth: false }, style: {} },
						// @ts-expect-error small is matched as the ownerState's boolean
						{ props: { small: "true" }, style: {} },
						// @ts-expect-error icon does not reach the button
						{ props: { icon: null }, style: {} },
						{
							// a props function gets the ownerState's flags over the props
							props: ({ small, color, disabled, ownerState }) =>
								small && color === ownerState.color && !disabled,
							style: {},
						},
						{
							// @ts-expect-error color is the ownerState's flag here; a props object matches the color
							props: ({ color }) => color === "error",
							style: {},
						},
					],
				},
				CcSubActionButton: {
					variants: [
						{ props: { disableDivider: true, small: false }, style: {} },
						// @ts-expect-error disableDivider is matched as the ownerState's boolean
						{ props: { disableDivider: "true" }, style: {} },
						{
							props: ({ disableDivider, ownerState }) =>
								disableDivider === ownerState.disableDivider,
							style: {},
						},
					],
				},
				CcCheckbox: {
					variants: [
						{ props: { size: "small" }, style: {} },
						{
							// a props function gets Checkbox's props directly
							props: ({ checked }) => checked === true,
							style: {},
						},
						{
							// @ts-expect-error Checkbox's slot gets no ownerState
							props: ({ ownerState }) => !!ownerState,
							style: {},
						},
					],
				},
				CcComponentWithLabel: {
					variants: [
						{ props: { labelPlacement: "start" }, style: {} },
						// @ts-expect-error labelText does not reach the root
						{ props: { labelText: "Caption" }, style: {} },
						{
							// @ts-expect-error ComponentWithLabel's slots get no ownerState
							props: ({ ownerState }) => !!ownerState,
							style: {},
						},
					],
				},
				CcFormButtons: {
					// @ts-expect-error the root gets none of FormButtons' props, a variant could match none
					variants: [{ props: { className: "bar" }, style: {} }],
				},
				CcCenteredTypography: {
					// @ts-expect-error the root gets none of CenteredTypography's props, a variant could match none
					variants: [{ props: { variant: "h6" }, style: {} }],
				},
			},
		});
		expect(variants(theme)).toHaveLength(17);
	});
});
