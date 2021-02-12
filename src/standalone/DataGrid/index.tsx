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
import { Grid, Theme, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Header, { IDataGridHeaderProps } from "./Header";
import Footer from "./Footer";
import Settings from "./Settings";
import Content from "./Content";
import { IFilterDef } from "./Content/FilterEntry";
import { Loader } from "../index";
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

export type DataGridProps = IDataGridHeaderProps &
	IDataGridColumnProps &
	IDataGridCallbacks & {
		/**
		 * Custom styles
		 */
		classes?: Partial<ReturnType<typeof useStyles>>;
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
}

export type DataGridAdditionalFilters = Record<string, unknown>;
export type DataGridSortSetting = { field: string; direction: -1 | 1 };

export interface IDataGridAddButton {
	/**
	 * Label of the add button
	 */
	label: NonNullable<React.ReactNode>;
	/**
	 * onClick handler for the add button
	 */
	onClick: () => void;
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
	 */
	onDelete?: (
		invert: boolean,
		ids: string[],
		filter?: Pick<
			IDataGridLoadDataParameters,
			"quickFilter" | "additionalFilters" | "fieldFilter"
		>
	) => void;
	/**
	 * Do we support and enable the delete all functionality?
	 * If not set select all will only select all ids on the current page
	 */
	enableDeleteAll?: boolean;
	/**
	 * Limits the amount of chainable column filters
	 */
	filterLimit?: number;
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
	refreshData: boolean;
	/**
	 * Custom user-defined data
	 */
	customData: DataGridCustomDataType;
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
	columns: IDataGridColumnDef[]
): IDataGridState => ({
	search: "",
	rowsTotal: 0,
	rowsFiltered: null,
	showSettings: false,
	pages: [0, 0],
	hiddenColumns: columns.filter((col) => col.hidden).map((col) => col.field),
	lockedColumns: [],
	selectAll: false,
	selectedRows: [],
	rows: {},
	dataLoadError: null,
	refreshData: true,
	customData: {},
});

export const getDataGridDefaultColumnsState = (
	columns: IDataGridColumnDef[]
): IDataGridColumnsState => {
	const data: IDataGridColumnsState = {};
	columns.forEach((column) => {
		data[column.field] = {
			sort: 0,
			filter: undefined,
		};
	});
	return data;
};

const useStyles = makeStyles((theme: Theme) => ({
	wrapper: {
		width: "100%",
		height: "100%",
		border: `1px solid ${theme.palette.divider}`,
		borderRadius: 8,
		backgroundColor: theme.palette.background.paper,
	},
	middle: {
		borderTop: `1px solid ${theme.palette.divider}`,
		position: "relative",
	},
	footer: {
		borderTop: `1px solid ${theme.palette.divider}`,
		marginTop: 1,
	},
	cell: {
		//borderRight: `1px ${theme.palette.divider} solid`,
		borderBottom: `1px ${theme.palette.divider} solid`,
		padding: `0 ${HEADER_PADDING / 2}px`,
	},
	headerCell: {
		borderRight: `1px ${theme.palette.divider} solid`,
		backgroundColor: theme.palette.background.paper,
		color: theme.palette.getContrastText(theme.palette.background.paper),
	},
	dataCell: {
		overflow: "hidden",
		whiteSpace: "nowrap",
		textOverflow: "ellipsis",
		padding: HEADER_PADDING / 2,
		backgroundColor: theme.palette.background.paper,
		color: theme.palette.getContrastText(theme.palette.background.paper),
	},
	dataCellSelected: {
		backgroundColor: theme.palette.action.hover,
		color: theme.palette.getContrastText(theme.palette.background.paper),
	},
	columnHeaderContentWrapper: {
		width: "100%",
		minWidth: "100%",
		zIndex: 1000,
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
	filterBarBox: {
		height: "100%",
	},
	filterBarGrid: {
		height: `calc(100% + ${theme.spacing(2)}px)`,
	},
	setFilterContainer: {
		maxHeight: "40vh",
		overflow: "auto",
	},
	settingsCollapse: {
		position: "absolute",
		zIndex: 2000,
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
	settingsPaper: {
		padding: 16,
		borderBottom: `1px solid ${theme.palette.divider}`,
		borderRadius: 8,
	},
}));

export type DataGridClassKey = keyof ReturnType<typeof useStyles>;

export type DataGridTheme = Partial<
	Styles<Theme, DataGridProps, DataGridClassKey>
>;

const useThemeStyles = makeThemeStyles<DataGridProps, DataGridClassKey>(
	(theme) => theme.componentsCare?.dataGrid
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

const DataGrid = (props: DataGridProps) => {
	const { columns, loadData, getAdditionalFilters, forceRefreshToken } = props;
	const rowsPerPage = props.rowsPerPage || 50;

	const classes = useDataGridStylesInternal(props);
	const theme = useTheme();
	const statePack = useState<IDataGridState>(() =>
		getDataGridDefaultState(columns)
	);
	const [state, setState] = statePack;
	const {
		search,
		rows,
		pages,
		dataLoadError,
		hiddenColumns,
		lockedColumns,
		refreshData,
	} = state;

	const gridRoot = useRef<HTMLDivElement>();

	const visibleColumns = useMemo(
		() => getActiveDataGridColumns(columns, hiddenColumns, lockedColumns),
		[columns, hiddenColumns, lockedColumns]
	);

	const columnsStatePack = useState<IDataGridColumnsState>(() =>
		getDataGridDefaultColumnsState(columns)
	);
	const [columnsState] = columnsStatePack;

	const columnWidthStatePack = useState<Record<string, number>>(() => {
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
	});

	// refresh data if desired
	useEffect(() => {
		if (!refreshData) return;

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
							: {},
						fieldFilter: fieldFilter,
						sort: sorts,
					});
					// check if we are on an invalid page

					const dataRowsTotal = data.rowsFiltered ?? data.rowsTotal;

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
				refreshData: false,
			}));
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refreshData]);

	// instant refresh on pagination change
	const refresh = useCallback(
		() =>
			setState((prevState) => ({
				...prevState,
				refreshData: true,
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
					refreshData: true,
				}));
			}, 500),
		[setState]
	);

	useEffect(() => {
		// make sure we don't refresh data twice on initial render
		if (refreshData && isObjectEmpty(rows)) return;

		resetView();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resetView, search, columnsState, forceRefreshToken]);
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
								<Grid item>
									<Header />
								</Grid>
								<Grid item xs className={classes.middle}>
									<Settings columns={columns} />
									{refreshData && isObjectEmpty(rows) && <Loader />}
									{!refreshData &&
										dataLoadError !== null &&
										dataLoadError.message}
									{!refreshData &&
										dataLoadError === null &&
										isObjectEmpty(rows) &&
										"No Data!"}
									{!isObjectEmpty(rows) && (
										<Content
											columns={visibleColumns}
											rowsPerPage={rowsPerPage}
										/>
									)}
								</Grid>
								<Grid item className={classes.footer}>
									<Footer />
								</Grid>
							</DataGridColumnsWidthStateContext.Provider>
						</DataGridColumnsStateContext.Provider>
					</DataGridStateContext.Provider>
				</DataGridPropsContext.Provider>
			</DataGridRootRefContext.Provider>
		</Grid>
	);
};

export default React.memo(DataGrid);
