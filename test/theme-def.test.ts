import { describe, expect, it } from "vitest";
import { createTheme, Theme, ThemeProvider } from "@mui/material";
import type {} from "../src/theme-def";
import React, { createElement } from "react";
import { act, render, screen } from "@testing-library/react";
import {
	selectorLocalLoadHandler,
	SingleSelect,
} from "../src/standalone/Selector";
import {
	UiKitInput,
	UiKitInputOutlined,
	UiKitTextField,
} from "../src/standalone/UIKit/CommonStyles";
import PageTitle from "../src/non-standalone/PageTitle/PageTitle";
import FileUpload from "../src/standalone/FileUpload/Generic";
import ImagePreviewDialog from "../src/standalone/FileUpload/Image/ImagePreviewDialog";
import type { MenuItemProps as PortalMenuItemProps } from "../src/standalone/Portal/Menu";
import MenuItemMaterial from "../src/standalone/Portal/MenuItem/Material";
import MenuItemJumboReactLight from "../src/standalone/Portal/MenuItem/JumboReact/Light";
import MenuItemJumboReactDark from "../src/standalone/Portal/MenuItem/JumboReact/Dark";
import LocaleSelectorEntry from "../src/non-standalone/LocaleSelector/LocaleSelectorEntry";
import WeekView from "../src/standalone/Schedule/Weekly";
import { Toast, ToastProps } from "../src/standalone/Toast";
import ImageBox from "../src/standalone/FileUpload/MultiImage/ImageBox";
import DayContents from "../src/standalone/Schedule/Common/DayContents";

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
				CcFormLoaderOverlay: {
					styleOverrides: {
						// @ts-expect-error no slot of FormLoaderOverlay receives an ownerState
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
				CcInfoBox: {
					styleOverrides: {
						// @ts-expect-error no slot of InfoBox receives an ownerState
						summary: ({ ownerState }) => ({
							color: ownerState ? "red" : "blue",
						}),
					},
				},
			},
		});
		expect(overrideFunctions(theme)).toEqual(
			Array(57).fill(expect.any(Function)),
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
	it("[ISSUE-3473-ITEM-14] types the variants of FormLoaderOverlay as matching visible, without an ownerState", () => {
		const theme = createTheme({
			components: {
				CcFormLoaderOverlay: {
					variants: [
						{ props: { visible: true }, style: {} },
						{ props: ({ visible }) => visible === false, style: {} },
						// @ts-expect-error message does not reach the root
						{ props: { message: "Saving…" }, style: {} },
						{
							// @ts-expect-error FormLoaderOverlay's slots get no ownerState
							props: ({ ownerState }) => !!ownerState,
							style: {},
						},
					],
				},
			},
		});
		expect(theme.components?.CcFormLoaderOverlay?.variants).toHaveLength(4);
	});
	it("[ISSUE-3465-ITEM-19] a theme cannot show a selector's switch without its switchLabel", () => {
		// switchLabel is the switch's visible text and its only accessible name, so default
		// props that show the switch need it, as the selector's own props do
		createTheme({
			components: {
				CcBaseSelector: {
					// @ts-expect-error displaySwitch shows the switch, which needs switchLabel
					defaultProps: { displaySwitch: true },
				},
				CcMultiSelect: {
					// @ts-expect-error displaySwitch shows the switch, which needs switchLabel
					defaultProps: { displaySwitch: true },
				},
				CcMultiSelectWithoutGroup: {
					// @ts-expect-error displaySwitch shows the switch, which needs switchLabel
					defaultProps: { displaySwitch: true },
				},
				CcMultiSelectWithTags: {
					// @ts-expect-error displaySwitch shows the switch, which needs switchLabel
					defaultProps: { displaySwitch: true },
				},
				CcBackendSingleSelect: {
					// @ts-expect-error switchFilterName shows the switch, which needs switchLabel
					defaultProps: { switchFilterName: "include_inactive" },
				},
				CcBackendMultiSelect: {
					// @ts-expect-error switchFilterName shows the switch, which needs switchLabel
					defaultProps: { switchFilterName: "include_inactive" },
				},
				CcBackendMultipleSelect: {
					// @ts-expect-error switchFilterName shows the switch, which needs switchLabel
					defaultProps: { switchFilterName: "include_inactive" },
				},
				CcBackendMultiSelectWithTags: {
					// @ts-expect-error switchFilterNameData shows the switch, which needs switchLabel
					defaultProps: { switchFilterNameData: "include_inactive" },
				},
				CcGridSingleSelectFilterBackend: {
					// @ts-expect-error switchFilterName shows the switch, which needs switchLabel
					defaultProps: { switchFilterName: "include_inactive" },
				},
				CcGridMultiSelectFilterBackend: {
					// @ts-expect-error switchFilterName shows the switch, which needs switchLabel
					defaultProps: { switchFilterName: "include_inactive" },
				},
			},
		});
		createTheme({
			components: {
				CcBackendMultiSelectWithTags: {
					// @ts-expect-error switchFilterNameGroup shows the switch, which needs switchLabel
					defaultProps: { switchFilterNameGroup: "include_inactive" },
				},
			},
		});
	});
	it("[ISSUE-3465-ITEM-19] a theme can show a selector's switch with its switchLabel, and set the label or other defaults alone", () => {
		const switchLabel = "Show inactive";
		const theme = createTheme({
			components: {
				CcBaseSelector: {
					defaultProps: { displaySwitch: true, switchLabel },
				},
				CcMultiSelect: {
					defaultProps: { confirmDelete: true },
				},
				CcMultiSelectWithoutGroup: {
					defaultProps: { switchLabel },
				},
				CcMultiSelectWithTags: {
					defaultProps: { displaySwitch: true, switchLabel },
				},
				CcBackendSingleSelect: {
					defaultProps: { switchFilterName: "include_inactive", switchLabel },
				},
				CcBackendMultiSelect: {
					defaultProps: { switchLabel },
				},
				CcBackendMultipleSelect: {
					defaultProps: { switchFilterName: "include_inactive", switchLabel },
				},
				CcBackendMultiSelectWithTags: {
					defaultProps: {
						switchFilterNameGroup: "include_inactive",
						switchLabel,
					},
				},
				CcGridSingleSelectFilterBackend: {
					defaultProps: { switchFilterName: "include_inactive", switchLabel },
				},
				CcGridMultiSelectFilterBackend: {
					defaultProps: { searchResultLimit: 50 },
				},
			},
		});
		const { unmount } = render(
			createElement(
				ThemeProvider,
				{ theme },
				createElement(SingleSelect, {
					label: "Device type",
					selected: null,
					onSelect: () => {},
					onLoad: selectorLocalLoadHandler([]),
				}),
			),
		);
		expect(
			screen.getByRole("switch", { name: switchLabel }),
		).toBeInTheDocument();
		unmount();
	});
	it("[ISSUE-3462-ITEM-18] types the variants of the components whose root gets no ownerState as the props the root gets", () => {
		// MUI applies theme variants to the root slot only, matches them against the
		// props the root receives, and calls a props function with these props and
		// the root's ownerState, which these roots never get: a function that read it
		// threw on every instance. A root that gets none of its component's props
		// leaves nothing for a variant to match.
		const variants = (theme: Theme) =>
			Object.values(theme.components ?? {}).flatMap(
				(component) => (component as { variants?: unknown[] }).variants ?? [],
			);
		const onMenuClick = () => {};
		const theme = createTheme({
			components: {
				CcLoader: {
					variants: [
						{ props: { size: 24, text: "Loading", role: "alert" }, style: {} },
						// @ts-expect-error classes do not reach the root
						{ props: { classes: {} }, style: {} },
						// @ts-expect-error no slot of Loader gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcVerticalDivider: {
					variants: [
						{ props: ({ flexItem }) => flexItem === true, style: {} },
						// @ts-expect-error no slot of VerticalDivider gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcSmallIconButton: {
					variants: [
						{ props: { size: "large" }, style: {} },
						// @ts-expect-error no slot of SmallIconButton gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcSmallestIconButton: {
					variants: [
						{ props: { disabled: true }, style: {} },
						// @ts-expect-error no slot of SmallestIconButton gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcSmallListItem: {
					variants: [
						{ props: { dense: true }, style: {} },
						// @ts-expect-error no slot of SmallListItem gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcSmallListItemButton: {
					variants: [
						{ props: { selected: true }, style: {} },
						// @ts-expect-error no slot of SmallListItemButton gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcSelectorSmallListItem: {
					variants: [
						{ props: { dense: true }, style: {} },
						// @ts-expect-error no slot of SelectorSmallListItem gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcSelectorSmallListItemButton: {
					variants: [
						{ props: { selected: true }, style: {} },
						// @ts-expect-error no slot of SelectorSmallListItemButton gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcSmallListItemIcon: {
					variants: [
						{ props: { id: "icon" }, style: {} },
						// @ts-expect-error no slot of SmallListItemIcon gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcCountryFlag: {
					variants: [
						{ props: { code: "DE", named: true }, style: {} },
						// @ts-expect-error the root gets style together with the size
						{ props: { style: {} }, style: {} },
						// @ts-expect-error no slot of CountryFlag gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcGroupBox: {
					variants: [
						{ props: { smallLabel: true, disabled: true }, style: {} },
						// @ts-expect-error classes do not reach the root
						{ props: { classes: {} }, style: {} },
						// @ts-expect-error no slot of GroupBox gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcPageTitle: {
					variants: [
						{ props: { variant: "h2" }, style: {} },
						// @ts-expect-error disableAutoTitle does not reach the root
						{ props: { disableAutoTitle: true }, style: {} },
						// @ts-expect-error no slot of PageTitle gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcPopupMenu: {
					variants: [
						{ props: { variant: "menu" }, style: {} },
						// @ts-expect-error the root gets its own slotProps
						{ props: { slotProps: {} }, style: {} },
						// @ts-expect-error no slot of PopupMenu gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcUiKitInput: {
					variants: [
						{ props: { warning: true }, style: {} },
						// @ts-expect-error no slot of UiKitInput gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcUiKitInputOutlined: {
					variants: [
						{ props: { dirty: true }, style: {} },
						// @ts-expect-error no slot of UiKitInputOutlined gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcUiKitTextField: {
					variants: [
						{ props: { size: "small" }, style: {} },
						// @ts-expect-error no slot of UiKitTextField gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcFileUpload: {
					variants: [
						{ props: { smallLabel: true }, style: {} },
						// @ts-expect-error the root gets the label with its dirty marker
						{ props: { label: "Files" }, style: {} },
						// @ts-expect-error no slot of FileUpload gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcImagePreviewDialog: {
					variants: [
						{ props: { open: true }, style: {} },
						// @ts-expect-error src does not reach the root
						{ props: { src: "image.png" }, style: {} },
						// @ts-expect-error no slot of ImagePreviewDialog gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcMenuItemMaterial: {
					variants: [
						{ props: { onClick: onMenuClick }, style: {} },
						// @ts-expect-error typographyProps do not reach the root
						{ props: { typographyProps: {} }, style: {} },
						// @ts-expect-error no slot of MenuItemMaterial gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcMenuItemJumboReactLight: {
					variants: [
						{ props: ({ onAuxClick }) => onAuxClick != null, style: {} },
						// @ts-expect-error typographyProps do not reach the root
						{ props: { typographyProps: {} }, style: {} },
						// @ts-expect-error no slot of MenuItemJumboReactLight gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcMenuItemJumboReactDark: {
					variants: [
						{ props: { onAuxClick: onMenuClick }, style: {} },
						// @ts-expect-error typographyProps do not reach the root
						{ props: { typographyProps: {} }, style: {} },
						// @ts-expect-error no slot of MenuItemJumboReactDark gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcLocaleSelectorEntry: {
					variants: [
						{ props: { disabled: true }, style: {} },
						// @ts-expect-error currentLanguage does not reach the root
						{ props: { currentLanguage: "de" }, style: {} },
						// @ts-expect-error no slot of LocaleSelectorEntry gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcWeekView: {
					variants: [
						{ props: { className: "compact" }, style: {} },
						// @ts-expect-error loadData does not reach the root
						{ props: ({ loadData }) => !!loadData, style: {} },
						// @ts-expect-error no slot of WeekView gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
			},
		});
		expect(variants(theme)).toHaveLength(58);

		// the roots of these get none of their component's props, or there is no root
		const withoutVariants = createTheme({
			components: {
				CcMultiGrid: {
					// @ts-expect-error the root gets none of MultiGrid's props
					variants: [{ props: {}, style: {} }],
				},
				CcDefaultFormPageButtons: {
					// @ts-expect-error DefaultFormPageButtons has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcMatrixGrid: {
					// @ts-expect-error the root gets none of MatrixGrid's props
					variants: [{ props: {}, style: {} }],
				},
				CcMatrixCellTile: {
					// @ts-expect-error the root gets none of MatrixCellTile's props
					variants: [{ props: {}, style: {} }],
				},
				CcFormPageLayout: {
					// @ts-expect-error the root gets none of FormPageLayout's props
					variants: [{ props: {}, style: {} }],
				},
				CcImageDots: {
					// @ts-expect-error the root gets none of ImageDots' props
					variants: [{ props: {}, style: {} }],
				},
				CcImageDialogEntry: {
					// @ts-expect-error the root gets none of ImageDialogEntry's props
					variants: [{ props: {}, style: {} }],
				},
				CcCollapsibleMenu: {
					// @ts-expect-error the root gets none of CollapsibleMenu's props
					variants: [{ props: {}, style: {} }],
				},
				CcMultiImage: {
					// @ts-expect-error the root gets none of MultiImage's props
					variants: [{ props: {}, style: {} }],
				},
				CcPortalLayoutMenu: {
					// @ts-expect-error PortalLayoutMenu has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcSignPadDialog: {
					// @ts-expect-error the root gets none of SignPadDialog's props
					variants: [{ props: {}, style: {} }],
				},
				CcFile: {
					// @ts-expect-error File has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcDialogTitle: {
					// @ts-expect-error the root gets none of DialogTitle's props
					variants: [{ props: {}, style: {} }],
				},
				CcCrudLoadStatus: {
					// @ts-expect-error CrudLoadStatus has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcImageSelector: {
					// @ts-expect-error ImageSelector has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcPortalMenu: {
					// @ts-expect-error the root gets none of PortalMenu's props
					variants: [{ props: {}, style: {} }],
				},
				CcLocaleSelectorDialog: {
					// @ts-expect-error the root gets none of LocaleSelectorDialog's props
					variants: [{ props: {}, style: {} }],
				},
				CcLocaleSelectorDialogContent: {
					// @ts-expect-error LocaleSelectorDialogContent has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcSignPad: {
					// @ts-expect-error the root gets none of SignPad's props
					variants: [{ props: {}, style: {} }],
				},
				CcFormDialog: {
					// @ts-expect-error FormDialog has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcMultiSelectWithTags: {
					// @ts-expect-error the root gets none of MultiSelectWithTags' props
					variants: [{ props: {}, style: {} }],
				},
				CcMultiSelectWithoutGroup: {
					// @ts-expect-error MultiSelectWithoutGroup has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcWeekViewDay: {
					// @ts-expect-error WeekViewDay has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcScrollableSchedule: {
					// @ts-expect-error ScrollableSchedule has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcScrollableScheduleDay: {
					// @ts-expect-error the root gets none of ScrollableScheduleDay's props
					variants: [{ props: {}, style: {} }],
				},
				CcDataGrid: {
					// @ts-expect-error the root gets none of DataGrid's props
					variants: [{ props: {}, style: {} }],
				},
				CcGridMultiSelectFilter: {
					// @ts-expect-error GridMultiSelectFilter has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcGridMultiSelectFilterBackend: {
					// @ts-expect-error GridMultiSelectFilterBackend has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcGridSingleSelectFilter: {
					// @ts-expect-error GridSingleSelectFilter has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcGridSingleSelectFilterBackend: {
					// @ts-expect-error GridSingleSelectFilterBackend has no root slot
					variants: [{ props: {}, style: {} }],
				},
			},
		});
		expect(variants(withoutVariants)).toHaveLength(30);
	});
	it("[ISSUE-3462-ITEM-18] applies the variants of the UIKit inputs, matched against their props", () => {
		const theme = createTheme({
			components: {
				CcUiKitInput: {
					variants: [
						{
							props: { disabled: true },
							style: { outlineColor: "rgb(1, 2, 3)" },
						},
					],
				},
				CcUiKitInputOutlined: {
					variants: [
						{
							props: ({ readOnly }) => readOnly === true,
							style: { outlineColor: "rgb(4, 5, 6)" },
						},
					],
				},
				CcUiKitTextField: {
					variants: [
						{
							props: { size: "small" },
							style: { outlineColor: "rgb(7, 8, 9)" },
						},
					],
				},
			},
		});
		render(
			createElement(
				ThemeProvider,
				{ theme },
				createElement(UiKitInput, { inputProps: { "aria-label": "a" } }),
				createElement(UiKitInput, {
					disabled: true,
					inputProps: { "aria-label": "b" },
				}),
				createElement(UiKitInputOutlined, {
					inputProps: { "aria-label": "c" },
				}),
				createElement(UiKitInputOutlined, {
					readOnly: true,
					inputProps: { "aria-label": "d" },
				}),
				createElement(UiKitTextField, { label: "e" }),
				createElement(UiKitTextField, { label: "f", size: "small" }),
			),
		);
		const outline = (name: string, root: string) =>
			getComputedStyle(
				screen.getByRole("textbox", { name }).closest(root) as HTMLElement,
			).outlineColor;
		expect(outline("a", ".MuiInputBase-root")).not.toBe("rgb(1, 2, 3)");
		expect(outline("b", ".MuiInputBase-root")).toBe("rgb(1, 2, 3)");
		expect(outline("c", ".MuiInputBase-root")).not.toBe("rgb(4, 5, 6)");
		expect(outline("d", ".MuiInputBase-root")).toBe("rgb(4, 5, 6)");
		expect(outline("e", ".MuiTextField-root")).not.toBe("rgb(7, 8, 9)");
		expect(outline("f", ".MuiTextField-root")).toBe("rgb(7, 8, 9)");
	});
	it("[ISSUE-3462-ITEM-18] applies the variants of PageTitle, matched against its props with variant h1 when it is not set", () => {
		const theme = createTheme({
			components: {
				CcPageTitle: {
					variants: [
						{ props: { variant: "h1" }, style: { color: "rgb(1, 2, 3)" } },
					],
				},
			},
		});
		render(
			createElement(
				ThemeProvider,
				{ theme },
				createElement(PageTitle, { disableAutoTitle: true }, "Devices"),
				createElement(
					PageTitle,
					{ disableAutoTitle: true, variant: "h2" },
					"Details",
				),
			),
		);
		expect(
			getComputedStyle(screen.getByRole("heading", { name: "Devices" })).color,
		).toBe("rgb(1, 2, 3)");
		expect(
			getComputedStyle(screen.getByRole("heading", { name: "Details" })).color,
		).not.toBe("rgb(1, 2, 3)");
	});
	it("[ISSUE-3462-ITEM-18] applies the variants of FileUpload and ImagePreviewDialog, matched against their props", async () => {
		const theme = createTheme({
			components: {
				CcFileUpload: {
					variants: [
						{
							props: { smallLabel: true },
							style: { outlineColor: "rgb(1, 2, 3)" },
						},
					],
				},
				CcImagePreviewDialog: {
					variants: [
						{ props: { open: true }, style: { outlineColor: "rgb(4, 5, 6)" } },
						{
							props: ({ onClose }) => onClose == null,
							style: { borderTopColor: "rgb(7, 8, 9)" },
						},
					],
				},
			},
		});
		const upload = (label: string, smallLabel?: boolean) =>
			createElement(FileUpload, {
				label,
				smallLabel,
				previewSize: 24,
				handleError: () => {},
				files: [],
			});
		const { container } = render(
			createElement(
				ThemeProvider,
				{ theme },
				upload("Documents"),
				upload("Attachments", true),
				createElement(ImagePreviewDialog, {
					src: "data:image/gif;base64,R0lGODlhAQABAAAAACw=",
					alt: "Preview",
					open: true,
					onClose: () => {},
				}),
			),
		);
		const [normal, small] = Array.from(container.querySelectorAll("fieldset"));
		expect(getComputedStyle(normal).outlineColor).not.toBe("rgb(1, 2, 3)");
		expect(getComputedStyle(small).outlineColor).toBe("rgb(1, 2, 3)");
		const dialogRoot = (await screen.findByRole("dialog")).closest(
			".MuiDialog-root",
		) as HTMLElement;
		expect(getComputedStyle(dialogRoot).outlineColor).toBe("rgb(4, 5, 6)");
		expect(getComputedStyle(dialogRoot).borderTopColor).not.toBe(
			"rgb(7, 8, 9)",
		);
	});
	it("[ISSUE-3462-ITEM-18] applies the variants of the menu items and LocaleSelectorEntry, matched against their props", () => {
		const onDevices = () => {};
		const theme = createTheme({
			components: {
				CcMenuItemMaterial: {
					variants: [
						{
							props: { onClick: onDevices },
							style: { outlineColor: "rgb(1, 2, 3)" },
						},
					],
				},
				CcMenuItemJumboReactLight: {
					variants: [
						{
							props: { onClick: onDevices },
							style: { outlineColor: "rgb(4, 5, 6)" },
						},
					],
				},
				CcMenuItemJumboReactDark: {
					variants: [
						{
							props: ({ onAuxClick }) => onAuxClick === onDevices,
							style: { outlineColor: "rgb(7, 8, 9)" },
						},
					],
				},
				CcLocaleSelectorEntry: {
					variants: [
						{
							props: { disabled: true },
							style: { outlineColor: "rgb(10, 11, 12)" },
						},
					],
				},
			},
		});
		const item = (
			component: React.ComponentType<PortalMenuItemProps>,
			title: string,
			onClick: () => void,
		) =>
			createElement(component, {
				title,
				onClick,
				onAuxClick: onClick,
				expandable: false,
				depth: 0,
			});
		const entry = (locale: string, country: string, disabled: boolean) =>
			createElement(LocaleSelectorEntry, {
				locale: {
					locale,
					language_short: "de",
					country_short: country,
					country,
					language: "German",
					native_country: country,
					native_language: "Deutsch",
				},
				currentLanguage: "en",
				handleSwitch: () => {},
				disabled,
			});
		render(
			createElement(
				ThemeProvider,
				{ theme },
				createElement(
					"ul",
					null,
					item(MenuItemMaterial, "Material devices", onDevices),
					item(MenuItemMaterial, "Material home", () => {}),
					item(MenuItemJumboReactLight, "Light devices", onDevices),
					item(MenuItemJumboReactLight, "Light home", () => {}),
					item(MenuItemJumboReactDark, "Dark devices", onDevices),
					item(MenuItemJumboReactDark, "Dark home", () => {}),
					entry("de-DE", "DE", false),
					entry("de-AT", "AT", true),
				),
			),
		);
		// the menu items are buttons, the locale rows options
		const outline = (name: RegExp, role: "button" | "option" = "button") =>
			getComputedStyle(screen.getByRole(role, { name })).outlineColor;
		expect(outline(/Material devices/)).toBe("rgb(1, 2, 3)");
		expect(outline(/Material home/)).not.toBe("rgb(1, 2, 3)");
		expect(outline(/Light devices/)).toBe("rgb(4, 5, 6)");
		expect(outline(/Light home/)).not.toBe("rgb(4, 5, 6)");
		expect(outline(/Dark devices/)).toBe("rgb(7, 8, 9)");
		expect(outline(/Dark home/)).not.toBe("rgb(7, 8, 9)");
		expect(outline(/DE/, "option")).not.toBe("rgb(10, 11, 12)");
		expect(outline(/AT/, "option")).toBe("rgb(10, 11, 12)");
	});
	it("[ISSUE-3462-ITEM-18] applies the variants of WeekView, matched against its className", async () => {
		const emptyWeek = () => Array.from({ length: 7 }, () => []);
		const theme = createTheme({
			components: {
				CcWeekView: {
					variants: [
						{
							props: { className: "compact" },
							style: { outlineColor: "rgb(1, 2, 3)" },
						},
					],
				},
			},
		});
		const { container } = render(
			createElement(
				ThemeProvider,
				{ theme },
				createElement(WeekView, { loadData: emptyWeek, className: "compact" }),
				createElement(WeekView, { loadData: emptyWeek, className: "wide" }),
			),
		);
		expect(
			getComputedStyle(container.querySelector(".compact") as HTMLElement)
				.outlineColor,
		).toBe("rgb(1, 2, 3)");
		expect(
			getComputedStyle(container.querySelector(".wide") as HTMLElement)
				.outlineColor,
		).not.toBe("rgb(1, 2, 3)");
		// lets the weeks' loads settle
		await act(async () => {});
	});
	it("[ISSUE-3462-ITEM-19] types function styleOverrides without an ownerState for SignalPortlet, SignalPortletItem, Notifications and Toast, whose slots receive none", () => {
		const theme = createTheme({
			components: {
				CcSignalPortlet: {
					styleOverrides: {
						// @ts-expect-error no slot of SignalPortlet receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcSignalPortletItem: {
					styleOverrides: {
						// @ts-expect-error no slot of SignalPortletItem receives an ownerState
						root: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
				CcNotifications: {
					styleOverrides: {
						// @ts-expect-error no slot of Notifications receives an ownerState
						header: ({ ownerState }) => ({
							color: ownerState ? "red" : "blue",
						}),
					},
				},
				CcToast: {
					styleOverrides: {
						// @ts-expect-error no slot of Toast receives an ownerState
						alert: ({ ownerState }) => ({ color: ownerState ? "red" : "blue" }),
					},
				},
			},
		});
		expect(overrideFunctions(theme)).toEqual(
			Array(4).fill(expect.any(Function)),
		);
	});
	it("[ISSUE-3462-ITEM-19] types the ownerState of PortalLayout and DayContents, whose every slot receives one, as the flags it holds", () => {
		const flags = createTheme({
			components: {
				CcPortalLayout: {
					styleOverrides: {
						container: ({ ownerState }) => {
							const mobile: boolean = ownerState.mobile;
							return { color: mobile ? "red" : "blue" };
						},
					},
				},
				CcDayContents: {
					styleOverrides: {
						button: ({ ownerState }) => {
							const altBorder: boolean = ownerState.altBorder;
							const unClickable: boolean = ownerState.unClickable;
							return { color: altBorder || unClickable ? "red" : "blue" };
						},
					},
				},
			},
		});
		const props = createTheme({
			components: {
				CcPortalLayout: {
					styleOverrides: {
						container: ({ ownerState }) => ({
							// @ts-expect-error the container gets the layout's flags, not its props
							color: ownerState.headerContent ? "red" : "blue",
						}),
					},
				},
				CcDayContents: {
					styleOverrides: {
						button: ({ ownerState }) => ({
							// @ts-expect-error the button gets its flags, not the props
							color: ownerState.data ? "red" : "blue",
						}),
					},
				},
			},
		});
		expect([...overrideFunctions(flags), ...overrideFunctions(props)]).toEqual(
			Array(4).fill(expect.any(Function)),
		);
	});
	it("[ISSUE-3462-ITEM-19] types the ownerState of the components that pass one to some of their slots as optional flags", () => {
		// MUI calls every function of a component's styleOverrides while styling each
		// of its slots: ownerState holds the flags of the slot being styled, and is
		// undefined while a slot without one is styled
		const flags = createTheme({
			components: {
				CcMultiLanguageInput: {
					styleOverrides: {
						languageLabel: ({ ownerState }) => {
							const active: boolean | undefined = ownerState?.active;
							return { fontWeight: active ? 700 : 400 };
						},
					},
				},
				CcBaseSelector: {
					styleOverrides: {
						icon: ({ ownerState }) => {
							const iconSize: number | undefined = ownerState?.iconSize;
							return { borderRadius: iconSize ? iconSize / 2 : 0 };
						},
					},
				},
				CcMultiSelectEntry: {
					styleOverrides: {
						selected: ({ ownerState }) => {
							const ignore: boolean | undefined = ownerState?.ignore;
							const unClickable: boolean | undefined = ownerState?.unClickable;
							return { color: ignore || unClickable ? "red" : "blue" };
						},
						image: ({ ownerState }) => {
							const iconSize: number | undefined = ownerState?.iconSize;
							return { borderRadius: iconSize ? iconSize / 2 : 0 };
						},
					},
				},
				CcMultiSelect: {
					styleOverrides: {
						selector: ({ ownerState }) => {
							const selected: boolean | undefined = ownerState?.selected;
							return { color: selected ? "red" : "blue" };
						},
					},
				},
				CcImageBox: {
					styleOverrides: {
						root: ({ ownerState }) => {
							const dragging: boolean | undefined = ownerState?.dragging;
							const clickable: boolean | undefined = ownerState?.clickable;
							const background: boolean | undefined = ownerState?.background;
							return {
								color: dragging || clickable || background ? "red" : "blue",
							};
						},
						image: ({ ownerState }) => {
							const swipeLeft: boolean | undefined = ownerState?.swipeLeft;
							const swipeRight: boolean | undefined = ownerState?.swipeRight;
							const imageDots: boolean | undefined = ownerState?.imageDots;
							return {
								color: swipeLeft || swipeRight || imageDots ? "red" : "blue",
							};
						},
					},
				},
			},
		});
		const required = createTheme({
			components: {
				CcMultiLanguageInput: {
					styleOverrides: {
						languageLabel: ({ ownerState }) => ({
							// @ts-expect-error the language switcher and the adornment get no ownerState
							fontWeight: ownerState.active ? 700 : 400,
						}),
					},
				},
				CcBaseSelector: {
					styleOverrides: {
						icon: ({ ownerState }) => ({
							// @ts-expect-error only the icon gets an ownerState
							width: ownerState.iconSize,
						}),
					},
				},
				CcMultiSelectEntry: {
					styleOverrides: {
						selected: ({ ownerState }) => ({
							// @ts-expect-error only the row and the image get an ownerState
							color: ownerState.ignore ? "red" : "blue",
						}),
					},
				},
				CcMultiSelect: {
					styleOverrides: {
						selector: ({ ownerState }) => ({
							// @ts-expect-error only the selector gets an ownerState
							color: ownerState.selected ? "red" : "blue",
						}),
					},
				},
				CcImageBox: {
					styleOverrides: {
						root: ({ ownerState }) => ({
							// @ts-expect-error only the root and the image get an ownerState
							color: ownerState.dragging ? "red" : "blue",
						}),
					},
				},
			},
		});
		const props = createTheme({
			components: {
				CcMultiLanguageInput: {
					styleOverrides: {
						languageLabel: ({ ownerState }) => ({
							// @ts-expect-error the language button gets its flags, not the props
							color: ownerState?.enabledLanguages ? "red" : "blue",
						}),
					},
				},
				CcBaseSelector: {
					styleOverrides: {
						icon: ({ ownerState }) => ({
							// @ts-expect-error the icon gets its flags, not the props
							color: ownerState?.disabled ? "red" : "blue",
						}),
					},
				},
				CcMultiSelectEntry: {
					styleOverrides: {
						selected: ({ ownerState }) => ({
							// @ts-expect-error the row gets its flags, not the props
							color: ownerState?.changeState ? "red" : "blue",
						}),
					},
				},
				CcMultiSelect: {
					styleOverrides: {
						selector: ({ ownerState }) => ({
							// @ts-expect-error the selector gets its flags, not the props
							color: ownerState?.readOnly ? "red" : "blue",
						}),
					},
				},
				CcImageBox: {
					styleOverrides: {
						root: ({ ownerState }) => ({
							// @ts-expect-error the root gets its flags, not the props
							color: ownerState?.disableBackground ? "red" : "blue",
						}),
					},
				},
			},
		});
		expect([
			...overrideFunctions(flags),
			...overrideFunctions(required),
			...overrideFunctions(props),
		]).toEqual(Array(17).fill(expect.any(Function)));
	});
	it("[ISSUE-3462-ITEM-19] types the variants of Toast and ImageBox as what their root gets, and offers none to the components whose root gets none of their props", () => {
		const variants = (theme: Theme) =>
			Object.values(theme.components ?? {}).flatMap(
				(component) => (component as { variants?: unknown[] }).variants ?? [],
			);
		const theme = createTheme({
			components: {
				CcToast: {
					variants: [
						{ props: { open: true, autoHideDuration: null }, style: {} },
						{
							props: ({ anchorOrigin }) => anchorOrigin?.vertical === "top",
							style: {},
						},
						// @ts-expect-error the severity reaches the alert, not the root
						{ props: { severity: "error" }, style: {} },
						// @ts-expect-error no slot of Toast gets an ownerState
						{ props: ({ ownerState }) => !!ownerState, style: {} },
					],
				},
				CcImageBox: {
					variants: [
						{ props: { dragging: true, background: false }, style: {} },
						{ props: ({ ownerState }) => ownerState.clickable, style: {} },
						{ props: ({ clickable }) => clickable, style: {} },
						// @ts-expect-error the root gets its own flags, not the image's
						{ props: { swipeLeft: true }, style: {} },
						// @ts-expect-error fileName does not reach the root
						{ props: { fileName: "photo.jpg" }, style: {} },
					],
				},
			},
		});
		expect(variants(theme)).toHaveLength(9);

		// the roots of these get none of their component's props, or there is no root
		const withoutVariants = createTheme({
			components: {
				CcSignalPortlet: {
					// @ts-expect-error the root gets none of SignalPortlet's props
					variants: [{ props: {}, style: {} }],
				},
				CcSignalPortletItem: {
					// @ts-expect-error the root gets none of SignalPortletItem's props
					variants: [{ props: {}, style: {} }],
				},
				CcMultiLanguageInput: {
					// @ts-expect-error MultiLanguageInput has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcBaseSelector: {
					// @ts-expect-error BaseSelector has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcMultiSelectEntry: {
					// @ts-expect-error the root gets none of MultiSelectEntry's props
					variants: [{ props: {}, style: {} }],
				},
				CcMultiSelect: {
					// @ts-expect-error the root gets none of MultiSelect's props
					variants: [{ props: {}, style: {} }],
				},
				CcLocalizedKeyboardDatePicker: {
					// @ts-expect-error LocalizedKeyboardDatePicker has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcPortalLayout: {
					// @ts-expect-error PortalLayout has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcNotifications: {
					// @ts-expect-error Notifications has no root slot
					variants: [{ props: {}, style: {} }],
				},
				CcDayContents: {
					// @ts-expect-error DayContents has no root slot
					variants: [{ props: {}, style: {} }],
				},
			},
		});
		expect(variants(withoutVariants)).toHaveLength(10);
	});
	it("[ISSUE-3462-ITEM-19] applies the variants of Toast, matched against open, anchorOrigin and autoHideDuration with their defaults", async () => {
		const theme = createTheme({
			components: {
				CcToast: {
					variants: [
						{
							props: ({ anchorOrigin }) => anchorOrigin?.vertical === "top",
							style: { outlineColor: "rgb(1, 2, 3)" },
						},
						{
							props: { autoHideDuration: null },
							style: { borderTopColor: "rgb(4, 5, 6)" },
						},
						{
							props: { open: true, autoHideDuration: 6000 },
							style: { borderBottomColor: "rgb(7, 8, 9)" },
						},
					],
				},
			},
		});
		const toast = (message: string, props: Partial<ToastProps>) =>
			createElement(Toast, {
				open: true,
				message,
				onClose: () => {},
				...props,
			});
		render(
			createElement(
				ThemeProvider,
				{ theme },
				toast("Saved", {
					anchorOrigin: { vertical: "top", horizontal: "center" },
				}),
				toast("Kept", { autoHideDuration: null }),
				toast("Failed", { severity: "error" }),
			),
		);
		const root = async (message: string) =>
			getComputedStyle(
				(await screen.findByText(message)).closest(
					".MuiSnackbar-root",
				) as HTMLElement,
			);
		expect((await root("Saved")).outlineColor).toBe("rgb(1, 2, 3)");
		expect((await root("Kept")).outlineColor).not.toBe("rgb(1, 2, 3)");
		expect((await root("Kept")).borderTopColor).toBe("rgb(4, 5, 6)");
		expect((await root("Saved")).borderTopColor).not.toBe("rgb(4, 5, 6)");
		// an error toast hides after 6 s by default
		expect((await root("Failed")).borderBottomColor).toBe("rgb(7, 8, 9)");
		expect((await root("Saved")).borderBottomColor).not.toBe("rgb(7, 8, 9)");
	});
	it("[ISSUE-3462-ITEM-19] styles ImageBox from its flags: variants match the root's, and style override functions get each slot's", () => {
		const theme = createTheme({
			components: {
				CcImageBox: {
					variants: [
						{
							props: { background: false },
							style: { outlineColor: "rgb(1, 2, 3)" },
						},
					],
					styleOverrides: {
						root: ({ ownerState }) =>
							ownerState?.clickable ? { borderTopColor: "rgb(4, 5, 6)" } : {},
						image: ({ ownerState }) =>
							ownerState?.swipeRight
								? { borderBottomColor: "rgb(7, 8, 9)" }
								: {},
					},
				},
			},
		});
		// jsdom has no layout and no Element.scrollTo; ImageBox centres its swipe pane with it
		(Element.prototype as unknown as { scrollTo: unknown }).scrollTo ??= () =>
			undefined;
		const image = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
		const { container } = render(
			createElement(
				ThemeProvider,
				{ theme },
				createElement(ImageBox, {
					image,
					className: "plain",
					onClick: null,
				}),
				createElement(ImageBox, {
					image,
					className: "styled",
					onClick: () => {},
					onNextImage: () => {},
					disableBackground: true,
				}),
			),
		);
		const plain = container.querySelector(".plain") as HTMLElement;
		const styled = container.querySelector(".styled") as HTMLElement;
		expect(getComputedStyle(plain).outlineColor).not.toBe("rgb(1, 2, 3)");
		expect(getComputedStyle(styled).outlineColor).toBe("rgb(1, 2, 3)");
		expect(getComputedStyle(plain).borderTopColor).not.toBe("rgb(4, 5, 6)");
		expect(getComputedStyle(styled).borderTopColor).toBe("rgb(4, 5, 6)");
		const img = (root: HTMLElement) =>
			getComputedStyle(root.querySelector("img") as HTMLElement);
		expect(img(plain).borderBottomColor).not.toBe("rgb(7, 8, 9)");
		expect(img(styled).borderBottomColor).toBe("rgb(7, 8, 9)");
	});
	it("[ISSUE-3462-ITEM-19] calls DayContents' style override functions with the flags every slot gets", () => {
		const theme = createTheme({
			components: {
				CcDayContents: {
					styleOverrides: {
						button: ({ ownerState }) =>
							ownerState.unClickable ? { outlineColor: "rgb(1, 2, 3)" } : {},
					},
				},
			},
		});
		render(
			createElement(
				ThemeProvider,
				{ theme },
				createElement(DayContents, {
					data: [
						{ id: "1", title: "Inspection", onClick: () => {} },
						{ id: "2", title: "Holiday" },
					],
				}),
			),
		);
		expect(
			getComputedStyle(screen.getByRole("button", { name: "Inspection" }))
				.outlineColor,
		).not.toBe("rgb(1, 2, 3)");
		expect(
			getComputedStyle(
				screen.getByText("Holiday").closest("button") as HTMLElement,
			).outlineColor,
		).toBe("rgb(1, 2, 3)");
	});
});
