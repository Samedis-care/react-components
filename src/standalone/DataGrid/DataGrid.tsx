import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	Box,
	Collapse,
	Divider,
	FormControlLabelProps,
	Grid,
	IconButton,
	ListItem,
	Paper,
	styled,
	Theme,
	Typography,
	useTheme,
	useThemeProps,
} from "@mui/material";
import { Apps as AppsIcon, Search as SearchIcon } from "@mui/icons-material";
import Header, { IDataGridHeaderProps } from "./Header";
import Footer from "./Footer";
import Settings from "./Settings";
import Content from "./Content";
import { FilterType, IFilterDef } from "./Content/FilterEntry";
import debounce from "../../utils/debounce";
import isObjectEmpty from "../../utils/isObjectEmpty";
import measureText from "../../utils/measureText";
import shallowCompareArray from "../../utils/shallowCompareArray";
import { dataGridPrepareFiltersAndSorts } from "./CallbackUtil";
import { ModelFilterType } from "../../backend-integration/Model";
import { HEADER_PADDING } from "./Content/ColumnHeader";
import CustomFilterDialog from "./CustomFilterDialog";
import StatePersistence, {
	DataGridPersistentStateContext,
} from "./StatePersistence";
import { IDataGridContentSelectRowViewProps } from "./Content/SelectRowView";
import { CustomFilterActiveContext } from "./Header/FilterBar";
import combineClassNames from "../../utils/combineClassNames";
import Checkbox from "../UIKit/Checkbox";
import ComponentWithLabel, {
	ComponentWithLabelProps,
} from "../UIKit/ComponentWithLabel";
import FilterIcon from "../Icons/FilterIcon";
import BaseSelector from "../Selector/BaseSelector";
import SingleSelect from "../Selector/SingleSelect";

export type DataGridProps = IDataGridHeaderProps &
	IDataGridColumnProps &
	IDataGridCallbacks & {
		/**
		 * Custom CSS class to apply to root
		 */
		className?: string;
		/**
		 * Custom styles
		 */
		classes?: Partial<Record<DataGridClassKey, string>>;
		/**
		 * Custom data action buttons
		 * Rendered next to delete.
		 * Max 1 extra button to fit on mobile screens
		 */
		customDataActionButtons?: {
			/**
			 * The icon of the button
			 */
			icon: React.ReactNode;
			/**
			 * The label of the button
			 * @remarks must be unique
			 */
			label: string;
			/**
			 * Is the button disabled?
			 * @param numSelected The amount of selected rows
			 * 										0 => none
			 * 									  1 => one
			 * 									  2 => multiple
			 */
			isDisabled: (numSelected: 0 | 1 | 2) => boolean;
			/**
			 * The click handler
			 * @param invert Is the selection inverted? (if true => ids = everything except ids)
			 * @param ids The ids
			 */
			onClick: (invert: boolean, ids: string[]) => void;
		}[];
		/**
		 * Hides the footer
		 */
		disableFooter?: boolean;
		/**
		 * Custom selection control (instead of default checkbox)
		 */
		customSelectionControl?: React.ComponentType<IDataGridContentSelectRowViewProps>;
		/**
		 * Enable the global scroll listener (listens for page up/down keydown events)
		 */
		globalScrollListener?: boolean;
	};

export interface IDataGridLoadDataParameters {
	/**
	 * The page to load
	 */
	page: number;
	/**
	 * The amount of rows per page
	 */
	rows: number;
	/**
	 * The search box content
	 */
	quickFilter: string;
	/**
	 * Additional filters specified by you
	 */
	additionalFilters: DataGridAdditionalFilters;
	/**
	 * The field filter contents
	 */
	fieldFilter: IDataGridFieldFilter;
	/**
	 * The sort settings
	 */
	sort: DataGridSortSetting[];
}

export interface IDataGridCallbacks {
	/**
	 * Loads data for the grid
	 * @param params The load data parameters
	 * @returns The loaded data (resolve) or an error (reject)
	 */
	loadData: (
		params: IDataGridLoadDataParameters,
	) => DataGridData | Promise<DataGridData>;
	/**
	 * Specifies the amount of data entries to load at once.
	 * Defaults to 25
	 */
	rowsPerPage?: number;
	/**
	 * Token which is used to cause a forceful refresh of data
	 */
	forceRefreshToken?: string;
	/**
	 * Extracts additional filters from the provided custom data
	 * @param customData The custom user-defined state-stored data
	 */
	getAdditionalFilters?: (
		customData: DataGridCustomDataType,
	) => DataGridAdditionalFilters;
	/**
	 * Default initial values for custom data (overwritten by persisted custom data)
	 */
	defaultCustomData?: Record<string, unknown>;
	/**
	 * Forced initial values for custom data (overwrites persisted custom data)
	 */
	overrideCustomData?: Record<string, unknown>;
	/**
	 * Set the (initial) selection of the grid when provided/updated.
	 * Content: [invert, ids].
	 * Use together with onSelectionChange for controlled selection.
	 */
	selection?: [boolean, string[]];
	/**
	 * Event for selection change
	 * @param invert Are ids inverted? If true: Everything is selected except ids. If false: Only ids are selected
	 * @param ids The ids that are selected/not selected based on invert
	 */
	onSelectionChange?: (invert: boolean, ids: string[]) => void;
	/**
	 * Callback for row double click
	 * @param record The data of the row to choose field for double click
	 * @remarks Called additionally before edit handler
	 */
	onRowDoubleClick?: (record: Record<string, unknown>) => void;
	/**
	 * Callback to check if filter is supported
	 * @param dataType The data type
	 * @param filterType The filter type
	 * @param fieldName the column field name
	 * @returns Supported?
	 */
	isFilterSupported?: (
		dataType: ModelFilterType,
		filterType: FilterType,
		fieldName: string,
	) => boolean;
	/**
	 * Callback for unhandled JS errors
	 * @param err The unhandled error
	 */
	onError?: (err: Error) => void;
	/**
	 * Callback for import button click
	 * If not defined: Import button will not show
	 */
	onImport?: () => void;
	/**
	 * Callback to show a row as selected/unselected based on the data record it contains.
	 * Defaults to return selected. Use in conjunction with canSelectRow.
	 * @param selected The current selected state (as determined by data grid)
	 * @param record The data record
	 * @return Should the DataGrid display the record as selected?
	 */
	isSelected?: (selected: boolean, record: Record<string, unknown>) => boolean;
	/**
	 * Can toggle selection callback. Can be used to disable selection for select rows.
	 * Defaults to return true. Use in conjunction with isSelected.
	 * @param record The data record
	 * @return Can the row be selected
	 */
	canSelectRow?: (record: Record<string, unknown>) => boolean;
}

export type DataGridAdditionalFilters = Record<string, unknown>;
export type DataGridSortSetting = { field: string; direction: -1 | 1 };
export type DataGridFilterSetting = { field: string; filter: IFilterDef };

export interface IDataGridAddButton {
	/**
	 * The icon
	 */
	icon?: React.ReactNode;
	/**
	 * Label of the add button
	 */
	label: NonNullable<React.ReactNode>;
	/**
	 * onClick handler for the add button
	 * Set undefined to disable button
	 */
	onClick: (() => void) | undefined;
	/**
	 * Disable button reason hint
	 */
	disableHint?: string;
}

export interface IDataGridColumnProps {
	/**
	 * Column definitions
	 */
	columns: IDataGridColumnDef[];
	/**
	 * Placeholder for search box
	 */
	searchPlaceholder?: string;
	/**
	 * Add new handler(s), do not specify to disable add new button(s). Set to string to show disabled add new button with hint
	 */
	onAddNew?: (() => void) | string | IDataGridAddButton[];
	/**
	 * Edit handler
	 * @param id The id to edit
	 */
	onEdit?: (id: string) => void;
	/**
	 * Delete handler, do not specify to disable deletion
	 * @param invert if invert is true, delete everything except ids, otherwise only delete ids
	 * @param ids The list of ids to (not) delete
	 * @param filter The current data grid filter (if set)
	 * @return Promise Optional promise, which will cancel automatic unselect if rejected
	 */
	onDelete?: (
		invert: boolean,
		ids: string[],
		filter?: Pick<
			IDataGridLoadDataParameters,
			"quickFilter" | "additionalFilters" | "fieldFilter"
		>,
	) => Promise<void> | unknown;
	/**
	 * Reason why delete is disabled
	 */
	disableDeleteHint?: string;
	/**
	 * Do we support and enable the delete all functionality?
	 * If not set select all will only select all ids on the current page
	 */
	enableDeleteAll?: boolean;
	/**
	 * Limits the amount of chainable column filters
	 * @remarks This is zero-indexed, so max 1 filter means pass 0, max 2 filter => 1, etc
	 */
	filterLimit?: number;
	/**
	 * Limits the amount of active sorts
	 * @remarks This is zero-indexed, so max 1 sorts means pass 0, max 2 sorts => 1, etc
	 */
	sortLimit?: number;
	/**
	 * Disable selecting multiple entries (disables select all & delete all)
	 */
	prohibitMultiSelect?: boolean;
	/**
	 * Hide checkbox column
	 */
	disableSelection?: boolean;
	/**
	 * The default sort settings
	 */
	defaultSort?: DataGridSortSetting[];
	/**
	 * The default column filter settings
	 */
	defaultFilter?: DataGridFilterSetting[];
	/**
	 * The column filter settings override (disables all filters if set)
	 */
	overrideFilter?: DataGridFilterSetting[];
	/**
	 * Header height override (in px)
	 * @default 32
	 */
	headerHeight?: number;
}

export type IDataGridFieldFilter = { [field: string]: IFilterDef };

export interface DataGridSetFilterDataEntry {
	/**
	 * The value to pass to the backend.
	 * Must not contain comma as it is being used as separator.
	 */
	value: string;
	/**
	 * The label to display
	 * Fallback if not set: getLabelText
	 */
	getLabel?: () => React.ReactNode;
	/**
	 * The label text
	 */
	getLabelText: () => string;
	/**
	 * Is the value disabled
	 */
	disabled?: boolean;
	/**
	 * Is the value a divider
	 */
	isDivider?: boolean;
}

export type DataGridSetFilterData = DataGridSetFilterDataEntry[];

export interface IDataGridColumnDef {
	/**
	 * The field name
	 */
	field: string;
	/**
	 * The field label
	 */
	headerName: string;
	/**
	 * Optional label override for column header
	 * @remarks You should supply a string unless you want to customize this
	 */
	headerLabel?: NonNullable<React.ReactNode>;
	/**
	 * The data type used for filtering
	 */
	type: ModelFilterType;
	/**
	 * Filter data, required for the following types:
	 * - enum (DataGridSetFilterData)
	 */
	filterData?: DataGridSetFilterData;
	/**
	 * Hidden by default?
	 */
	hidden?: boolean;
	/**
	 * Can the column be filtered?
	 */
	filterable?: boolean;
	/**
	 * Can the column be sorted?
	 */
	sortable?: boolean;
	/**
	 * Pinned by default?
	 */
	pinned?: boolean;
	/**
	 * Force the column to be pinned?
	 */
	forcePin?: boolean;
	// internal fields, do not set, will be overwritten
	/**
	 * Is the column locked to the start
	 */
	isLocked?: boolean;
	/**
	 * Column width configuration
	 */
	width?: [minWidth: number, maxWidth: number, initialWidth?: number];
}

export interface IDataGridColumnState {
	/**
	 * The current sort setting
	 */
	sort: -1 | 0 | 1;
	/**
	 * The sort priority (lower = higher priority)
	 */
	sortOrder?: number;
	/**
	 * The enabled filter
	 */
	filter: IFilterDef | undefined;
}

export interface DataGridData {
	/**
	 * Total amount of rows
	 */
	rowsTotal: number;
	/**
	 * Amount of rows shown
	 */
	rowsFiltered?: number;
	/**
	 * Row data
	 */
	rows: DataGridRowData[];
}

export type DataGridRowData = { id: string } & Record<
	string,
	string | number | { toString: () => string } | React.ReactElement | null
>;
export type DataGridCustomDataType = Record<string, unknown>;

export interface IDataGridState {
	/**
	 * The current search (quick filter) string
	 */
	search: string;
	/**
	 * The page start and end indexes
	 */
	pages: [start: number, end: number];
	/**
	 * The total amount of rows
	 */
	rowsTotal: number;
	/**
	 * The amount of rows shown if view is filtered
	 */
	rowsFiltered: number | null;
	/**
	 * Show the settings popover
	 */
	showSettings: boolean;
	/**
	 * Show the custom filter dialog
	 */
	showFilterDialog: boolean;
	/**
	 * The hidden fields
	 */
	hiddenColumns: string[];
	/**
	 * The locked fields
	 */
	lockedColumns: string[];
	/**
	 * Is everything selected? (inverts selection)
	 */
	selectAll: boolean;
	/**
	 * The selected rows
	 */
	selectedRows: string[];
	/**
	 * Was the selection updated by DataGrid props
	 */
	selectionUpdatedByProps: boolean;
	/**
	 * The rows to be shown
	 */
	rows: Record<number, DataGridRowData>;
	/**
	 * Error returned by loadData
	 */
	dataLoadError: Error | null;
	/**
	 * Should loadData be called?
	 */
	refreshData: number;
	/**
	 * Should refresh data wipe the rows (when its on 2). This is needed because
	 * filters can change between refreshes without being reset
	 */
	refreshShouldWipeRows: boolean;
	/**
	 * Custom user-defined data
	 */
	customData: DataGridCustomDataType;
	/**
	 * Initially resized?
	 */
	initialResize: boolean;
}

const DataGridStateContext = React.createContext<
	[IDataGridState, Dispatch<SetStateAction<IDataGridState>>] | undefined
>(undefined);

export const useDataGridState = (): [
	IDataGridState,
	Dispatch<SetStateAction<IDataGridState>>,
] => {
	const ctx = useContext(DataGridStateContext);
	if (!ctx) throw new Error("State context not set");
	return ctx;
};

const DataGridPropsContext = React.createContext<DataGridProps | undefined>(
	undefined,
);

export const useDataGridProps = (): DataGridProps => {
	const ctx = useContext(DataGridPropsContext);
	if (!ctx) throw new Error("Props context not set");
	return ctx;
};

export type IDataGridColumnsState = { [field: string]: IDataGridColumnState };

export type DataGridColumnState = [
	/**
	 * Column state of all columns
	 */
	IDataGridColumnsState,
	/**
	 * Update column state callback
	 */
	Dispatch<SetStateAction<IDataGridColumnsState>>,
];

const DataGridColumnsStateContext = React.createContext<
	DataGridColumnState | undefined
>(undefined);

export const useDataGridColumnState = (): DataGridColumnState => {
	const ctx = useContext(DataGridColumnsStateContext);
	if (!ctx) throw new Error("Columns state context not set");
	return ctx;
};

export type DataGridColumnsWidthState = [
	/**
	 * Field -> Width in px
	 */
	Record<string, number>,
	/**
	 * Set state function
	 */
	Dispatch<SetStateAction<Record<string, number>>>,
];

const DataGridColumnsWidthStateContext = React.createContext<
	DataGridColumnsWidthState | undefined
>(undefined);

export const useDataGridColumnsWidthState = (): DataGridColumnsWidthState => {
	const ctx = useContext(DataGridColumnsWidthStateContext);
	if (!ctx) throw new Error("Columns state width context not set");
	return ctx;
};

const DataGridRootRefContext = React.createContext<
	React.RefObject<HTMLDivElement> | undefined
>(undefined);

export const useDataGridRootRef = (): React.RefObject<HTMLDivElement> => {
	const ctx = useContext(DataGridRootRefContext);
	if (!ctx) throw new Error("RootRef context not set");
	return ctx;
};

export const getDataGridDefaultState = (
	columns: IDataGridColumnDef[],
	defaultCustomData: Record<string, unknown> | undefined,
): IDataGridState => ({
	search: "",
	rowsTotal: 0,
	rowsFiltered: null,
	showSettings: false,
	showFilterDialog: false,
	pages: [0, 0],
	hiddenColumns: columns.filter((col) => col.hidden).map((col) => col.field),
	lockedColumns: columns
		.filter((col) => col.pinned || col.forcePin)
		.map((col) => col.field),
	selectAll: false,
	selectedRows: [],
	selectionUpdatedByProps: false,
	rows: {},
	dataLoadError: null,
	refreshData: 1,
	refreshShouldWipeRows: false,
	customData: defaultCustomData ?? {},
	initialResize: false,
});

export const getDataGridDefaultColumnsState = (
	columns: IDataGridColumnDef[],
	defaultSort: DataGridSortSetting[] | undefined,
	defaultFilter: DataGridFilterSetting[] | undefined,
): IDataGridColumnsState => {
	const data: IDataGridColumnsState = {};
	columns.forEach((column) => {
		const defaultSortIndex = defaultSort?.findIndex(
			(entry) => entry.field === column.field,
		);
		const defaultFilterSetting = defaultFilter?.find(
			(entry) => entry.field === column.field,
		);
		data[column.field] = {
			sort:
				defaultSort && defaultSortIndex !== -1 && defaultSortIndex != null
					? defaultSort[defaultSortIndex].direction
					: 0,
			sortOrder:
				defaultSortIndex != null && defaultSortIndex >= 0
					? defaultSortIndex + 1
					: undefined,
			filter: defaultFilterSetting?.filter,
		};
	});
	return data;
};

const Wrapper = styled(Grid, { name: "CcDataGrid", slot: "root" })(
	({ theme }) => ({
		width: "100%",
		height: "100%",
		flexGrow: 1,
		borderRadius: theme.shape.borderRadius,
		border: `1px solid ${theme.palette.divider}`,
		backgroundColor: theme.palette.background.paper,
	}),
);

const HeaderWrapper = styled(Grid, { name: "CcDataGrid", slot: "header" })(
	({ theme }) => ({
		border: `1px solid ${theme.palette.divider}`,
		borderWidth: "0 0 1px 0",
	}),
);

const ContentWrapper = styled(Grid, { name: "CcDataGrid", slot: "content" })({
	position: "relative",
});

const FooterWrapper = styled(Grid, { name: "CcDataGrid", slot: "footer" })(
	({ theme }) => ({
		border: `1px solid ${theme.palette.divider}`,
		borderWidth: "1px 0 0 0",
	}),
);

export const DataGridContentOverlayCollapse = styled(Collapse, {
	name: "CcDataGrid",
	slot: "contentOverlayCollapse",
})({
	position: "absolute",
	zIndex: 1000,
	width: "100%",
	maxHeight: "100%",
	overflow: "auto",
});

export const DataGridContentOverlayPaper = styled(Paper, {
	name: "CcDataGrid",
	slot: "contentOverlayPaper",
})(({ theme }) => ({
	padding: theme.spacing(1),
}));

export const DataGridContentOverlayClosed = styled("div", {
	name: "CcDataGrid",
	slot: "contentOverlayClosed",
})(({ theme }) => ({
	position: "sticky",
	bottom: 0,
	left: 0,
	right: 0,
	backgroundColor: theme.palette.background.paper,
}));

export const DataGridCustomFilterDialogTitle = styled(Typography, {
	name: "CcDataGrid",
	slot: "customFilterContainerHeader",
})({});

export const DataGridCustomFilterContainer = styled(Grid, {
	name: "CcDataGrid",
	slot: "customFilterContainer",
})(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingBottom: theme.spacing(2),
}));

export const DataGridSelectCheckbox = styled(Checkbox, {
	name: "CcDataGrid",
	slot: "selectCheckbox",
})({
	padding: 0,
});

export const DataGridSelectAllCheckbox = styled(Checkbox, {
	name: "CcDataGrid",
	slot: "selectAllCheckbox",
})({
	padding: 0,
});

export const DataGridSelectAllWrapper = styled(ComponentWithLabel, {
	name: "CcDataGrid",
	slot: "selectAllWrapper",
})<ComponentWithLabelProps | FormControlLabelProps>({});

export const DataGridPaginationText = styled(Typography, {
	name: "CcDataGrid",
	slot: "paginationText",
})({
	padding: "12px 0",
});

export const DataGridSetFilterListDivider = styled(Divider, {
	name: "CcDataGrid",
	slot: "setFilterListDivider",
})({
	width: "100%",
});

export const DataGridSetFilterListItemDivider = styled(ListItem, {
	name: "CcDataGrid",
	slot: "setFilterListItemDivider",
})({
	padding: 0,
});

export const DataGridSetFilterListItem = styled(ListItem, {
	name: "CcDataGrid",
	slot: "setFilterListItem",
})({
	paddingLeft: 0,
	paddingRight: 0,
});

export const DataGridSetFilterContainer = styled(Grid, {
	name: "CcDataGrid",
	slot: "setFilterContainer",
})({
	maxHeight: "40vh",
	overflow: "auto",
});

export const DataGridFilterBarGrid = styled(Grid, {
	name: "CcDataGrid",
	slot: "filterBarGrid",
})(({ theme }) => ({
	height: `calc(100% + ${theme.spacing(2)})`,
	width: "100%",
}));

export const DataGridFilterBarBox = styled(Box, {
	name: "CcDataGrid",
	slot: "filterBarBox",
})({
	height: "100%",
});

export const DataGridFilterClearButton = styled(IconButton, {
	name: "CcDataGrid",
	slot: "filterClearBtn",
})({
	padding: 0,
});

export const DataGridColumnHeaderLabel = styled(Grid, {
	name: "CcDataGrid",
	slot: "columnHeaderLabel",
})({
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
	overflow: "hidden",
	userSelect: "none",
	"&:hover": {
		pointerEvents: "auto",
	},
});

export const DataGridColumnHeaderResizer = styled(Grid, {
	name: "CcDataGrid",
	slot: "columnHeaderResizer",
})(({ theme }) => ({
	cursor: "col-resize",
	width: 8,
	height: "100%",
	right: 0,
	top: 0,
	position: "absolute",
	border: `1px solid ${theme.palette.divider}`,
	borderWidth: "0 0 0 0",
}));

export const DataGridColumnHeaderSortIcon = styled(Grid, {
	name: "CcDataGrid",
	slot: "columnHeaderSortIcon",
})({
	height: 24,
});

export const DataGridColumnHeaderContentWrapper = styled("div", {
	name: "CcDataGrid",
	slot: "columnHeaderContentWrapper",
})(({ theme }) => ({
	width: "100%",
	minWidth: "100%",
	zIndex: 1000,
	border: `1px solid ${theme.palette.divider}`,
	borderWidth: "0 0 0 0",
	"&.CcDataGrid-columnHeaderFilterable": {
		color: theme.palette.primary.main,
	},
}));

export const DataGridCell = styled("div", { name: "CcDataGrid", slot: "cell" })(
	({ theme }) => ({
		border: `1px solid ${theme.palette.divider}`,
		borderWidth: "0 1px 1px 0",
		padding: `0 ${HEADER_PADDING / 2}px`,
		"&.CcDataGrid-dataCell": {
			overflow: "hidden",
			whiteSpace: "nowrap",
			textOverflow: "ellipsis",
			"& > *": {
				overflow: "hidden",
				whiteSpace: "nowrap",
				textOverflow: "ellipsis",
			},
			padding: HEADER_PADDING / 2,
			color: theme.palette.getContrastText(theme.palette.background.paper),
		},
		"&.CcDataGrid-headerCell": {
			borderWidth: 0,
			padding: `0 ${HEADER_PADDING / 2}px`,
			backgroundColor: theme.palette.background.paper,
			color: theme.palette.getContrastText(theme.palette.background.paper),
		},
		"&.CcDataGrid-dataCellSelected": {
			backgroundColor: theme.palette.action.hover,
			color: theme.palette.getContrastText(theme.palette.background.paper),
		},
	}),
);

export const DataGridColumnHeaderFilterPopup = styled(Grid, {
	name: "CcDataGrid",
	slot: "columnHeaderFilterPopup",
})({
	width: 160,
});

export const DataGridColumnHeaderFilterPopupEnum = styled(Grid, {
	name: "CcDataGrid",
	slot: "columnHeaderFilterPopupEnum",
})({
	minWidth: 160,
});

export const DataGridColumnHeaderFilterIcon = styled(FilterIcon, {
	name: "CcDataGrid",
	slot: "columnHeaderFilterIcon",
})({
	width: 16,
	height: "auto",
});

export const DataGridColumnHeaderFilterActiveIcon = styled(FilterIcon, {
	name: "CcDataGrid",
	slot: "columnHeaderFilterActiveIcon",
})({
	width: 16,
	height: "auto",
});

export const DataGridColumnHeaderFilterButton = styled(IconButton, {
	name: "CcDataGrid",
	slot: "columnHeaderFilterButton",
})(({ theme }) => ({
	padding: 0,
	color: "inherit",
	"&.CcDataGrid-columnHeaderFilterButtonActive": {
		color: theme.palette.secondary.main,
	},
}));

export const DataGridQuickFilterIcon = styled(SearchIcon, {
	name: "CcDataGrid",
	slot: "quickFilterIcon",
})(({ theme }) => ({
	"&.CcDataGrid-quickFilterActiveIcon": {
		color: theme.palette.secondary.main,
	},
}));

export const DataGridCustomFilterIcon = styled(AppsIcon, {
	name: "CcDataGrid",
	slot: "customFilterIcon",
})(({ theme }) => ({
	color: theme.palette.primary.main,
	verticalAlign: "text-bottom",
	"&.CcDataGrid-customFilterActiveIcon": {
		color: theme.palette.secondary.main,
	},
}));

export const DataGridCustomFilterMulti = styled(BaseSelector, {
	name: "CcDataGrid",
	slot: "customFilterMulti",
})(({ theme }) => ({
	"& .MuiAutocomplete-root.Mui-active": {
		borderColor: theme.palette.secondary.main,
		"& > fieldset": {
			borderColor: theme.palette.secondary.main,
		},
		"& .MuiAutocomplete-inputRoot": {
			borderColor: theme.palette.secondary.main,
			"& > fieldset": {
				borderColor: theme.palette.secondary.main,
			},
		},
	},
})) as typeof BaseSelector;

export const DataGridCustomFilterSingle = styled(SingleSelect, {
	name: "CcDataGrid",
	slot: "customFilterSingle",
})(({ theme }) => ({
	"& .MuiAutocomplete-root.Mui-active": {
		borderColor: theme.palette.secondary.main,
		"& > fieldset": {
			borderColor: theme.palette.secondary.main,
		},
		"& .MuiAutocomplete-inputRoot": {
			borderColor: theme.palette.secondary.main,
			"& > fieldset": {
				borderColor: theme.palette.secondary.main,
			},
		},
	},
})) as typeof SingleSelect;

export type DataGridClassKey =
	| "root"
	| "header"
	| "content"
	| "footer"
	| "contentOverlayCollapse"
	| "contentOverlayPaper"
	| "contentOverlayClosed"
	| "customFilterContainer"
	| "selectCheckbox"
	| "selectAllCheckbox"
	| "selectAllWrapper"
	| "paginationText"
	| "setFilterListDivider"
	| "setFilterListItemDivider"
	| "setFilterListItem"
	| "setFilterContainer"
	| "filterBarGrid"
	| "filterBarBox"
	| "filterClearBtn"
	| "columnHeaderLabel"
	| "columnHeaderResizer"
	| "columnHeaderSortIcon"
	| "columnHeaderContentWrapper"
	| "cell"
	| "columnHeaderFilterPopup"
	| "columnHeaderFilterPopupEnum"
	| "columnHeaderFilterIcon"
	| "columnHeaderFilterActiveIcon"
	| "columnHeaderFilterButton"
	| "quickFilterIcon"
	| "customFilterIcon"
	| "customFilterMulti"
	| "customFilterSingle"
	| "centeredStickyTypography"
	| "settingsTableCell"
	| "customFilterContainerHeader";

export const getActiveDataGridColumns = (
	columns: IDataGridColumnDef[],
	hiddenColumns: string[],
	lockedColumns: string[],
): IDataGridColumnDef[] => {
	return columns
		.filter((column) => !hiddenColumns.includes(column.field))
		.filter((column) => lockedColumns.includes(column.field))
		.concat(
			columns
				.filter((column) => !hiddenColumns.includes(column.field))
				.filter((column) => !lockedColumns.includes(column.field)),
		)
		.map((column) => ({
			...column,
			isLocked: lockedColumns.includes(column.field),
		}));
};

export const getDefaultColumnWidths = (
	columns: IDataGridColumnDef[],
	theme: Theme,
): Record<string, number> => {
	const widthData: Record<string, number> = {};
	columns.forEach((column) => {
		try {
			widthData[column.field] =
				measureText(
					theme.typography.body1.font || "16px Roboto, sans-serif",
					column.headerName,
				).width + 100;
		} catch (e) {
			// if canvas is not available to measure text
			widthData[column.field] = column.headerName.length * 16;
		}
		if (column.width) {
			// initial width
			if (column.width[2] !== undefined) {
				widthData[column.field] = column.width[2];
			}
			// min width
			widthData[column.field] = Math.max(
				column.width[0],
				widthData[column.field],
			);
			// max width
			widthData[column.field] = Math.min(
				column.width[1],
				widthData[column.field],
			);
		}
	});
	return widthData;
};

const DataGrid = (inProps: DataGridProps) => {
	const props = useThemeProps({ props: inProps, name: "CcDataGrid" });
	const {
		columns,
		loadData,
		getAdditionalFilters,
		forceRefreshToken,
		defaultCustomData,
		overrideCustomData,
		onSelectionChange,
		defaultSort,
		defaultFilter,
		disableFooter,
		disableSelection,
		headerHeight,
		selection,
		overrideFilter,
		globalScrollListener,
		className,
		classes,
	} = props;
	const rowsPerPage = props.rowsPerPage || 25;

	const theme = useTheme();
	const persistedContext = useContext(DataGridPersistentStateContext);
	const [persisted] = persistedContext || [];

	const statePack = useState<IDataGridState>(() => ({
		...getDataGridDefaultState(columns, undefined),
		...persisted?.state,
		customData:
			overrideCustomData ??
			persisted?.state?.customData ??
			defaultCustomData ??
			{},
	}));
	const [state, setState] = statePack;
	const {
		search,
		rows,
		pages,
		hiddenColumns,
		lockedColumns,
		refreshData,
		customData,
		selectAll,
		selectedRows,
		selectionUpdatedByProps,
	} = state;
	const lastRefreshData = useRef<number>(0);
	const activeCustomFiltersPack = useState(0);

	const gridRoot = useRef<HTMLDivElement>(null);

	const visibleColumns = useMemo(
		() => getActiveDataGridColumns(columns, hiddenColumns, lockedColumns),
		[columns, hiddenColumns, lockedColumns],
	);

	const columnsStatePack = useState<IDataGridColumnsState>(() => {
		const ret = {
			...getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter),
			...persisted?.columnState,
		};
		if (overrideFilter) {
			for (const field in ret) {
				ret[field].filter = undefined;
			}
			overrideFilter.forEach((override) => {
				if (override.field in ret) {
					ret[override.field].filter = override.filter;
				}
			});
		}
		return ret;
	});
	const [columnsState] = columnsStatePack;

	const columnWidthStatePack = useState<Record<string, number>>(() => ({
		...getDefaultColumnWidths(columns, theme),
		...persisted?.columnWidth,
	}));

	// update selection (if controlled)
	useEffect(() => {
		if (!selection) return;
		setState((prev) => {
			const stateEqual =
				prev.selectAll === selection[0] &&
				shallowCompareArray(prev.selectedRows, selection[1]);
			return stateEqual
				? prev
				: {
						...prev,
						selectAll: selection[0],
						selectedRows: selection[1],
						selectionUpdatedByProps: true,
					};
		});
	}, [setState, selection]);

	// refresh data if desired
	useEffect(() => {
		// we have an issue with a rare stuck loading bug. my assumption is that
		// React batches state updates and refreshData turns from 0 to 2 instantly
		// this causes a permanent loading screen because 1 is skipped
		const skippedFirstRefresh =
			lastRefreshData.current === 0 && refreshData === 2;
		lastRefreshData.current = refreshData;
		if (refreshData !== 1 && !skippedFirstRefresh) {
			return;
		}

		const [sorts, fieldFilter] = dataGridPrepareFiltersAndSorts(columnsState);

		void (async () => {
			for (let pageIndex = pages[0]; pageIndex <= pages[1]; pageIndex++) {
				// check if page was already loaded
				if (pageIndex * rowsPerPage in rows) {
					continue;
				}

				try {
					const data = await loadData({
						page: pageIndex + 1,
						rows: rowsPerPage,
						quickFilter: search,
						additionalFilters: getAdditionalFilters
							? getAdditionalFilters(state.customData)
							: state.customData,
						fieldFilter: fieldFilter,
						sort: sorts,
					});
					const dataRowsTotal = data.rowsFiltered ?? data.rowsTotal;

					// check if we are on an invalid page
					if (
						pageIndex !== 0 &&
						rowsPerPage !== 0 &&
						dataRowsTotal !== 0 &&
						data.rows.length === 0
					) {
						const hasPartialPage = dataRowsTotal % rowsPerPage !== 0;
						const newPage =
							((dataRowsTotal / rowsPerPage) | 0) + (hasPartialPage ? 0 : -1);
						// eslint-disable-next-line no-console
						console.assert(
							newPage !== pageIndex,
							"[Components-Care] [DataGrid] Detected invalid page, but newly calculated page equals invalid page",
						);
						if (newPage !== pageIndex) {
							setState((prevState) => ({
								...prevState,
								pages: [newPage, newPage],
							}));
						}
					}

					const rowsAsObject: Record<number, DataGridRowData> = {};
					for (let i = 0; i < data.rows.length; i++) {
						rowsAsObject[pageIndex * rowsPerPage + i] = data.rows[i];
					}

					setState((prevState) => ({
						...prevState,
						rowsTotal: data.rowsTotal,
						rowsFiltered: data.rowsFiltered ?? null,
						dataLoadError: null,
						rows: Object.assign({}, prevState.rows, rowsAsObject),
					}));
				} catch (err) {
					// eslint-disable-next-line no-console
					console.error("[Components-Care] [DataGrid] LoadData: ", err);
					setState((prevState) => ({
						...prevState,
						dataLoadError: err as Error,
						rowsFiltered: null,
						rowsTotal: 0,
					}));
				}
			}

			setState((prevState) => ({
				...prevState,
				refreshData: prevState.refreshData - 1,
				// handle filter changes invalidating data
				rows:
					prevState.refreshShouldWipeRows && prevState.refreshData === 2
						? {}
						: prevState.rows,
				selectedRows:
					prevState.refreshShouldWipeRows && prevState.refreshData === 2
						? []
						: prevState.selectedRows,
				refreshShouldWipeRows: false,
			}));
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refreshData]);

	// instant refresh on pagination change
	const refresh = useCallback(
		() =>
			setState((prevState) => ({
				...prevState,
				refreshData: Math.min(prevState.refreshData + 1, 2),
			})),
		[setState],
	);

	// delay refresh call till useEffect has been processed, so we don't deadlock when auto page correction in the refresh
	// data function is performed.
	useLayoutEffect(refresh, [refresh, pages]);

	// debounced refresh on filter and sort changes
	const resetView = useMemo(
		() =>
			debounce(() => {
				setState((prevState) => ({
					...prevState,
					rows: {},
					selectedRows: [],
					refreshData: Math.min(prevState.refreshData + 1, 2),
					refreshShouldWipeRows: prevState.refreshData === 1, // when we set refreshData to two and this is changing filters, we need an rows reset to prevent old data from getting displayed
				}));
			}, 500),
		[setState],
	);

	const initialRender = useRef(true);
	// reset initial render state after unmount (react 18 does remounts with persisted data)
	useEffect(() => {
		return () => {
			initialRender.current = true;
		};
	}, []);

	useEffect(() => {
		// make sure we don't refresh data twice on initial render
		if (refreshData && isObjectEmpty(rows) && initialRender.current) {
			initialRender.current = false;
			return;
		}

		resetView();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resetView, search, columnsState, customData, forceRefreshToken]);

	// selection change event
	useEffect(() => {
		// don't trigger selection update event when triggered by prop update
		if (selectionUpdatedByProps) return;
		if (onSelectionChange) {
			onSelectionChange(selectAll, selectedRows);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectAll, selectedRows]);

	return (
		<Wrapper
			container
			direction={"column"}
			justifyContent={"space-between"}
			alignItems={"stretch"}
			wrap={"nowrap"}
			className={combineClassNames([className, classes?.root])}
			ref={gridRoot}
		>
			<DataGridRootRefContext.Provider value={gridRoot}>
				<DataGridPropsContext.Provider value={props}>
					<DataGridStateContext.Provider value={statePack}>
						<DataGridColumnsStateContext.Provider value={columnsStatePack}>
							<DataGridColumnsWidthStateContext.Provider
								value={columnWidthStatePack}
							>
								<CustomFilterActiveContext.Provider
									value={activeCustomFiltersPack}
								>
									<StatePersistence />
									<HeaderWrapper item className={classes?.header}>
										<Header />
									</HeaderWrapper>
									<ContentWrapper item xs className={classes?.content}>
										<Settings columns={columns} />
										<CustomFilterDialog />
										<Content
											columns={visibleColumns}
											rowsPerPage={rowsPerPage}
											disableSelection={disableSelection}
											headerHeight={headerHeight}
											globalScrollListener={globalScrollListener}
										/>
									</ContentWrapper>
									{!disableFooter && (
										<FooterWrapper item className={classes?.footer}>
											<Footer />
										</FooterWrapper>
									)}
								</CustomFilterActiveContext.Provider>
							</DataGridColumnsWidthStateContext.Provider>
						</DataGridColumnsStateContext.Provider>
					</DataGridStateContext.Provider>
				</DataGridPropsContext.Provider>
			</DataGridRootRefContext.Provider>
		</Wrapper>
	);
};

export default React.memo(DataGrid);
