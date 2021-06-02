import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type * as Theming from "../../types/theming";

import { Grid, Theme, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Header, { IDataGridHeaderProps } from "./Header";
import Footer from "./Footer";
import Settings from "./Settings";
import Content from "./Content";
import { FilterType, IFilterDef } from "./Content/FilterEntry";
import {
	debounce,
	isObjectEmpty,
	measureText,
	makeThemeStyles,
	useMultipleStyles,
} from "../../utils";
import { dataGridPrepareFiltersAndSorts } from "./CallbackUtil";
import { ModelFilterType } from "../../backend-integration/Model";
import { HEADER_PADDING } from "./Content/ColumnHeader";
import { Styles } from "@material-ui/core/styles/withStyles";
import CustomFilterDialog from "./CustomFilterDialog";
import StatePersistence, {
	DataGridPersistentStateContext,
} from "./StatePersistence";
import { IDataGridContentSelectRowViewProps } from "./Content/SelectRowView";

export interface DataGridTheme extends Theming.BasicElementThemeFragment {
	/* root elements from BasicElementThemeFragment defining main grid container visuals */

	/* the header element containing quickfilter, selectors and buttons */
	header?: Theming.BasicElementThemeFragment;

	/* the content element with rows */
	content?: Theming.BasicElementThemeFragment & {
		row?: Theming.BasicElementThemeFragment & {
			odd?: Theming.BasicColorThemeFragment;
			even?: Theming.BasicColorThemeFragment;
			hover?: Theming.BasicColorThemeFragment;
			selected?: Theming.BasicColorThemeFragment;
			cell?: Theming.BasicElementThemeFragment & {
				header?: Theming.BasicTextThemeFragment & {
					label?: Theming.BasicTextThemeFragment;
					resizer?: Theming.BasicElementThemeFragment;
				};
				data?: Theming.BasicTextThemeFragment & {
					label?: Theming.BasicTextThemeFragment;
				};
			};
		};
	};

	/* the button that allows clearing any typed text */
	footer?: Theming.BasicElementThemeFragment & {
		/* element showing total record counter */
		total?: Theming.BasicElementThemeFragment;
	};
}

export type DataGridProps = IDataGridHeaderProps &
	IDataGridColumnProps &
	IDataGridCallbacks & {
		/**
		 * Custom styles
		 */
		classes?: Partial<ReturnType<typeof useStyles>>;
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
		params: IDataGridLoadDataParameters
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
		customData: DataGridCustomDataType
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
	 * Event for selection change
	 * @param invert Are ids inverted? If true: Everything is selected except ids. If false: Only ids are selected
	 * @param ids The ids that are selected/not selected based on invert
	 */
	onSelectionChange?: (invert: boolean, ids: string[]) => void;
	/**
	 * Callback for row double click
	 * @param id The ID of the row
	 * @remarks Called additionally before edit handler
	 */
	onRowDoubleClick?: (id: string) => void;
	/**
	 * Callback to check if filter is supported
	 * @param dataType The data type
	 * @param filterType The filter type
	 * @returns Supported?
	 */
	isFilterSupported?: (
		dataType: ModelFilterType,
		filterType: FilterType
	) => boolean;
	/**
	 * Callback for unhandled JS errors
	 * @param err The unhandled error
	 */
	onError?: (err: Error) => void;
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
	 * Set to undefined to disable button
	 */
	onClick: (() => void) | undefined;
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
	 * Add new handler(s), do not specify to disable add new button(s)
	 */
	onAddNew?: (() => void) | IDataGridAddButton[];
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
		>
	) => Promise<void> | unknown;
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
	Dispatch<SetStateAction<IDataGridState>>
] => {
	const ctx = useContext(DataGridStateContext);
	if (!ctx) throw new Error("State context not set");
	return ctx;
};

const DataGridPropsContext = React.createContext<DataGridProps | undefined>(
	undefined
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
	Dispatch<SetStateAction<IDataGridColumnsState>>
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
	Dispatch<SetStateAction<Record<string, number>>>
];

const DataGridColumnsWidthStateContext = React.createContext<
	DataGridColumnsWidthState | undefined
>(undefined);

export const useDataGridColumnsWidthState = (): DataGridColumnsWidthState => {
	const ctx = useContext(DataGridColumnsWidthStateContext);
	if (!ctx) throw new Error("Columns state width context not set");
	return ctx;
};

const DataGridRootRefContext = React.createContext<HTMLDivElement | undefined>(
	undefined
);

export const useDataGridRootRef = (): HTMLDivElement => {
	const ctx = useContext(DataGridRootRefContext);
	if (!ctx) throw new Error("RootRef context not set");
	return ctx;
};

export const getDataGridDefaultState = (
	columns: IDataGridColumnDef[],
	defaultCustomData: Record<string, unknown> | undefined
): IDataGridState => ({
	search: "",
	rowsTotal: 0,
	rowsFiltered: null,
	showSettings: false,
	showFilterDialog: false,
	pages: [0, 0],
	hiddenColumns: columns.filter((col) => col.hidden).map((col) => col.field),
	lockedColumns: [],
	selectAll: false,
	selectedRows: [],
	rows: {},
	dataLoadError: null,
	refreshData: 1,
	customData: defaultCustomData ?? {},
	initialResize: false,
});

export const getDataGridDefaultColumnsState = (
	columns: IDataGridColumnDef[],
	defaultSort: DataGridSortSetting[] | undefined,
	defaultFilter: DataGridFilterSetting[] | undefined
): IDataGridColumnsState => {
	const data: IDataGridColumnsState = {};
	columns.forEach((column) => {
		const defaultSortIndex = defaultSort?.findIndex(
			(entry) => entry.field === column.field
		);
		const defaultFilterSetting = defaultFilter?.find(
			(entry) => entry.field === column.field
		);
		data[column.field] = {
			sort:
				defaultSort && defaultSortIndex !== -1 && defaultSortIndex !== undefined
					? defaultSort[defaultSortIndex].direction
					: 0,
			sortOrder: defaultSortIndex ? defaultSortIndex + 1 : undefined,
			filter: defaultFilterSetting?.filter,
		};
	});
	return data;
};

const useStyles = makeStyles(
	(theme: Theme) => ({
		wrapper: {
			width: theme.componentsCare?.dataGrid?.width || "100%",
			height: theme.componentsCare?.dataGrid?.height || "100%",
			borderRadius:
				theme.componentsCare?.dataGrid?.borderRadius || theme.spacing(2),
			border:
				theme.componentsCare?.dataGrid?.border ||
				`1px solid ${theme.palette.divider}`,
			backgroundColor:
				theme.componentsCare?.dataGrid?.backgroundColor ||
				theme.palette.background.paper,
			background: theme.componentsCare?.dataGrid?.background,
			...theme.componentsCare?.dataGrid?.style,
		},
		header: {
			border:
				theme.componentsCare?.dataGrid?.header?.border ||
				`1px solid ${theme.palette.divider}`,
			borderWidth:
				theme.componentsCare?.dataGrid?.header?.borderWidth || "0 0 1px 0",
			padding: theme.componentsCare?.dataGrid?.header?.padding,
			background: theme.componentsCare?.dataGrid?.header?.background,
			backgroundColor: theme.componentsCare?.dataGrid?.header?.backgroundColor,
			...theme.componentsCare?.dataGrid?.header?.style,
		},
		content: {
			position: "relative",
			margin: theme.componentsCare?.dataGrid?.content?.margin,
			padding: theme.componentsCare?.dataGrid?.content?.padding,
			border: theme.componentsCare?.dataGrid?.content?.border,
			borderWidth: theme.componentsCare?.dataGrid?.content?.borderWidth,
			background: theme.componentsCare?.dataGrid?.content?.background,
			backgroundColor: theme.componentsCare?.dataGrid?.content?.backgroundColor,
			...theme.componentsCare?.dataGrid?.content?.style,
		},
		footer: {
			border:
				theme.componentsCare?.dataGrid?.footer?.border ||
				`1px solid ${theme.palette.divider}`,
			borderWidth:
				theme.componentsCare?.dataGrid?.footer?.borderWidth || "1px 0 0 0",
			padding: theme.componentsCare?.dataGrid?.footer?.padding,
			background: theme.componentsCare?.dataGrid?.footer?.background,
			backgroundColor: theme.componentsCare?.dataGrid?.footer?.backgroundColor,
			...theme.componentsCare?.dataGrid?.footer?.style,
		},
		rowOdd: {
			background: theme.componentsCare?.dataGrid?.content?.row?.background,
			backgroundColor:
				theme.componentsCare?.dataGrid?.content?.row?.backgroundColor,
			padding: theme.componentsCare?.dataGrid?.content?.row?.padding,
			...theme.componentsCare?.dataGrid?.content?.row?.odd,
		},
		rowEven: {
			background: theme.componentsCare?.dataGrid?.content?.row?.background,
			backgroundColor:
				theme.componentsCare?.dataGrid?.content?.row?.backgroundColor,
			padding: theme.componentsCare?.dataGrid?.content?.row?.padding,
			...theme.componentsCare?.dataGrid?.content?.row?.even,
		},
		cell: {
			border:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.data?.border ||
				theme.componentsCare?.dataGrid?.content?.row?.cell?.border ||
				`1px solid ${
					theme.componentsCare?.dataGrid?.content?.row?.cell?.data
						?.borderColor ?? theme.palette.divider
				}`,
			borderWidth:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.data?.borderWidth ||
				theme.componentsCare?.dataGrid?.content?.row?.cell?.borderWidth ||
				"0 1px 1px 0",
			padding:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.data?.padding ||
				theme.componentsCare?.dataGrid?.content?.row?.cell?.padding ||
				`0 ${HEADER_PADDING / 2}px`,
			...theme.componentsCare?.dataGrid?.content?.row?.cell?.data?.style,
		},
		headerCell: {
			border:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.border ||
				theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.border,
			borderWidth:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.borderWidth ||
				theme.componentsCare?.dataGrid?.content?.row?.cell?.header
					?.borderWidth ||
				"0 1px 1px 0",
			padding:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.padding ||
				theme.componentsCare?.dataGrid?.content?.row?.cell?.padding ||
				`0 ${HEADER_PADDING / 2}px`,
			backgroundColor:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.header
					?.backgroundColor || theme.palette.background.paper,
			color: theme.palette.getContrastText(
				theme.componentsCare?.dataGrid?.content?.row?.cell?.header
					?.backgroundColor ?? theme.palette.background.paper
			),
			...theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.style,
		},
		dataCell: {
			overflow: "hidden",
			whiteSpace: "nowrap",
			textOverflow: "ellipsis",
			padding: HEADER_PADDING / 2,
			borderColor:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.data?.borderColor ||
				theme.componentsCare?.dataGrid?.content?.row?.borderColor,
			color: theme.palette.getContrastText(
				theme.componentsCare?.dataGrid?.content?.backgroundColor ??
					theme.palette.background.paper
			),
			...theme.componentsCare?.dataGrid?.content?.row?.cell?.data?.style,
		},
		dataCellSelected: {
			backgroundColor:
				theme.componentsCare?.dataGrid?.content?.row?.selected
					?.backgroundColor || theme.palette.action.hover,
			color: theme.palette.getContrastText(
				theme.componentsCare?.dataGrid?.content?.row?.selected
					?.backgroundColor ||
					theme.componentsCare?.dataGrid?.content?.backgroundColor ||
					theme.palette.background.paper
			),
			...theme.componentsCare?.dataGrid?.content?.row?.selected?.style,
		},
		columnHeaderContentWrapper: {
			width: "100%",
			minWidth: "100%",
			zIndex: 1000,
			fontSize:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
					?.fontSize,
			fontWeight:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
					?.fontWeight,
			fontStyle:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
					?.fontStyle,
			border:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
					?.border ||
				`1px solid ${
					theme.componentsCare?.dataGrid?.content?.row?.cell?.borderColor ??
					theme.palette.divider
				}`,
			borderWidth:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
					?.borderWidth || "0 0 0 0",
			background:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
					?.background,
			backgroundColor:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
					?.backgroundColor,
			padding:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
					?.padding,
			...theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
				?.style,
		},
		columnHeaderFilterable: {
			color: theme.palette.primary.main,
		},
		columnHeaderFilterButton: {
			padding: 0,
			color: "inherit",
		},
		columnHeaderResizer: {
			cursor: "col-resize",
			width: 8,
			height: "100%",
			right: 0,
			top: 0,
			position: "absolute",
			border:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.resizer
					?.border ||
				`1px solid ${
					theme.componentsCare?.dataGrid?.content?.row?.cell?.borderColor ??
					theme.palette.divider
				}`,
			borderWidth:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.resizer
					?.borderWidth || "0 0 0 0",
			background:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.resizer
					?.background,
			backgroundColor:
				theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.resizer
					?.backgroundColor,
			...theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.resizer
				?.style,
		},
		columnHeaderFilterPopup: {
			width: 150,
		},
		columnHeaderFilterIcon: {
			width: 16,
			height: "auto",
		},
		columnHeaderSortIcon: {
			height: 24,
		},
		columnHeaderLabel: {
			textOverflow: "ellipsis",
			overflow: "hidden",
			"&:hover": {
				pointerEvents: "auto",
			},
		},
		disableClick: {
			userSelect: "none",
		},
		filterClearBtn: {
			padding: 0,
		},
		filterBarBox: {
			height: "100%",
		},
		filterBarGrid: {
			height: `calc(100% + ${theme.spacing(2)}px)`,
			width: "100%",
		},
		setFilterContainer: {
			maxHeight: "40vh",
			overflow: "auto",
		},
		contentOverlayCollapse: {
			position: "absolute",
			zIndex: 1000,
			width: "100%",
			maxHeight: "100%",
			overflow: "auto",
		},
		paginationText: {
			padding: "12px 0",
		},
		selectAllWrapper: {},
		selectAllCheckbox: {
			padding: "4px 0",
		},
		selectCheckbox: {
			padding: 0,
		},
		contentOverlayPaper: {
			padding: 16,
			borderBottom: `1px solid ${theme.palette.divider}`,
			borderRadius: 8,
		},
		customFilterContainer: {
			paddingTop: theme.spacing(2),
			paddingBottom: theme.spacing(2),
		},
	}),
	{ name: "CcDataGrid" }
);

export type DataGridClassKey = keyof ReturnType<typeof useStyles>;

export type DataGridThemeExpert = Partial<
	Styles<Theme, DataGridProps, DataGridClassKey>
>;

const useThemeStyles = makeThemeStyles<DataGridProps, DataGridClassKey>(
	(theme) => theme.componentsCare?.dataGridExpert,
	"CcDataGrid"
);

export const useDataGridStyles = (): ReturnType<typeof useStyles> => {
	return useDataGridStylesInternal(useDataGridProps());
};

const useDataGridStylesInternal = (
	props: DataGridProps
): ReturnType<typeof useStyles> => {
	return useMultipleStyles(props, useThemeStyles, useStyles);
};

export const getActiveDataGridColumns = (
	columns: IDataGridColumnDef[],
	hiddenColumns: string[],
	lockedColumns: string[]
): IDataGridColumnDef[] => {
	return columns
		.filter((column) => !hiddenColumns.includes(column.field))
		.filter((column) => lockedColumns.includes(column.field))
		.concat(
			columns
				.filter((column) => !hiddenColumns.includes(column.field))
				.filter((column) => !lockedColumns.includes(column.field))
		)
		.map((column) => ({
			...column,
			isLocked: lockedColumns.includes(column.field),
		}));
};

export const getDefaultColumnWidths = (
	columns: IDataGridColumnDef[],
	theme: Theme
): Record<string, number> => {
	const widthData: Record<string, number> = {};
	columns.forEach((column) => {
		try {
			widthData[column.field] =
				measureText(
					theme.typography.body1.font || "16px Roboto, sans-serif",
					column.headerName
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
				widthData[column.field]
			);
			// max width
			widthData[column.field] = Math.min(
				column.width[1],
				widthData[column.field]
			);
		}
	});
	return widthData;
};

const DataGrid = (props: DataGridProps) => {
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
	} = props;
	const rowsPerPage = props.rowsPerPage || 25;

	const theme = useTheme();
	const persistedContext = useContext(DataGridPersistentStateContext);
	const [persisted] = persistedContext || [];

	const classes = useDataGridStylesInternal(props);
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
	} = state;

	const gridRoot = useRef<HTMLDivElement>();

	const visibleColumns = useMemo(
		() => getActiveDataGridColumns(columns, hiddenColumns, lockedColumns),
		[columns, hiddenColumns, lockedColumns]
	);

	const columnsStatePack = useState<IDataGridColumnsState>(() => ({
		...getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter),
		...persisted?.columnState,
	}));
	const [columnsState] = columnsStatePack;

	const columnWidthStatePack = useState<Record<string, number>>(() => ({
		...getDefaultColumnWidths(columns, theme),
		...persisted?.columnWidth,
	}));

	// refresh data if desired
	useEffect(() => {
		if (refreshData !== 1) return;

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
							"[Components-Care] [DataGrid] Detected invalid page, but newly calculated page equals invalid page"
						);
						if (newPage !== pageIndex) {
							setState((prevState) => ({
								...prevState,
								pageIndex: newPage,
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
					}));
				}
			}

			setState((prevState) => ({
				...prevState,
				refreshData: prevState.refreshData - 1,
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
		[setState]
	);

	useEffect(refresh, [refresh, pages]);

	// debounced refresh on filter and sort changes
	const resetView = useMemo(
		() =>
			debounce(() => {
				setState((prevState) => ({
					...prevState,
					rows: {},
					refreshData: Math.min(prevState.refreshData + 1, 2),
				}));
			}, 500),
		[setState]
	);

	useEffect(() => {
		// make sure we don't refresh data twice on initial render
		if (refreshData && isObjectEmpty(rows)) return;

		resetView();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resetView, search, columnsState, customData, forceRefreshToken]);

	// selection change event
	useEffect(() => {
		if (onSelectionChange) {
			onSelectionChange(selectAll, selectedRows);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectAll, selectedRows]);

	return (
		<Grid
			container
			direction={"column"}
			justify={"space-between"}
			alignItems={"stretch"}
			wrap={"nowrap"}
			className={classes.wrapper}
			ref={(r) => (gridRoot.current = r ? r : undefined)}
		>
			<DataGridRootRefContext.Provider value={gridRoot.current}>
				<DataGridPropsContext.Provider value={props}>
					<DataGridStateContext.Provider value={statePack}>
						<DataGridColumnsStateContext.Provider value={columnsStatePack}>
							<DataGridColumnsWidthStateContext.Provider
								value={columnWidthStatePack}
							>
								<StatePersistence />
								<Grid item className={classes.header}>
									<Header />
								</Grid>
								<Grid item xs className={classes.content}>
									<Settings columns={columns} />
									<CustomFilterDialog />
									<Content
										columns={visibleColumns}
										rowsPerPage={rowsPerPage}
										disableSelection={disableSelection}
									/>
								</Grid>
								{!disableFooter && (
									<Grid item className={classes.footer}>
										<Footer />
									</Grid>
								)}
							</DataGridColumnsWidthStateContext.Provider>
						</DataGridColumnsStateContext.Provider>
					</DataGridStateContext.Provider>
				</DataGridPropsContext.Provider>
			</DataGridRootRefContext.Provider>
		</Grid>
	);
};

export default React.memo(DataGrid);
