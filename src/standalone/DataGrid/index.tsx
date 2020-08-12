import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Grid, Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Header, { IDataGridHeaderProps } from "./Header";
import Footer, { IDataGridFooterProps } from "./Footer";
import Settings from "./Settings";
import Content from "./Content";
import { IFilterDef } from "./Content/FilterEntry";
import { IDataGridColumnsState } from "./Content/Header";
import { Loader } from "../index";
import { debounce } from "../../utils";

export type IDataGridProps = IDataGridHeaderProps &
	IDataGridFooterProps &
	IDataGridColumnProps &
	IDataGridCallbacks;

export interface IDataGridCallbacks {
	loadData: (
		page: number,
		rows: number,
		quickFilter: string,
		additionalFilters: { [name: string]: any },
		fieldFilter: IDataGridFieldFilter,
		sort: { field: string; direction: -1 | 1 }[]
	) => Promise<DataGridRowData[]>;
}

export interface IDataGridColumnProps {
	columns: IDataGridColumnDef[];
	searchPlaceholder?: string;

	/**
	 * Add new handler, do not specify to disable add new button
	 */
	onAddNew?: () => void;
	/**
	 * Edit handler
	 * @param id The id to edit
	 */
	onEdit?: (id: string) => void;
	/**
	 * Delete handler, do not specify to disable deletion
	 * @param invert if invert is true, delete everything except ids, otherwise only delete ids
	 * @param ids The list of ids to (not) delete
	 */
	onDelete?: (invert: boolean, ids: string[]) => void;
}

export type IDataGridFieldFilter = { [field: string]: IFilterDef };

export interface IDataGridColumnDef {
	field: string;
	headerName: string;

	// internal fields, do not set
	isLocked?: boolean;
	fixedColumnKey?: string;
}

export interface IDataGridColumnState {
	sort: -1 | 0 | 1;
	sortOrder?: number;
	filter: IFilterDef | undefined;
}

export type DataGridRowData = { id: string } & { [key: string]: any };

export interface IDataGridState {
	search: string;
	rowsPerPage: number;
	rowsTotal: number;
	pageIndex: number;
	showSettings: boolean;
	hiddenColumns: string[];
	lockedColumns: string[];
	selectAll: boolean;
	selectedRows: string[];
	rows: DataGridRowData[] | null;
	dataLoadError: Error | null;
}

export const DataGridStateContext = React.createContext<
	[IDataGridState, Dispatch<SetStateAction<IDataGridState>>] | undefined
>(undefined);

export const DataGridPropsContext = React.createContext<
	IDataGridProps | undefined
>(undefined);

export const DataGridDefaultState: IDataGridState = {
	search: "",
	rowsPerPage: 25,
	rowsTotal: 100,
	pageIndex: 0,
	showSettings: false,
	hiddenColumns: [],
	lockedColumns: [],
	selectAll: false,
	selectedRows: [],
	rows: null,
	dataLoadError: null,
};

const useStyles = makeStyles((theme: Theme) => ({
	wrapper: {
		width: "100%",
		height: "100%",
		border: `1px solid ${theme.palette.divider}`,
		borderRadius: 8,
	},
	middle: {
		borderTop: `1px solid ${theme.palette.divider}`,
		borderBottom: `1px solid ${theme.palette.divider}`,
		position: "relative",
	},
}));

const DataGrid = React.memo((props: IDataGridProps) => {
	const { columns, loadData } = props;

	const classes = useStyles();
	const statePack = useState<IDataGridState>(DataGridDefaultState);
	const [state, setState] = statePack;
	const {
		search,
		pageIndex,
		rowsPerPage,
		rows,
		dataLoadError,
		hiddenColumns,
		lockedColumns,
	} = state;

	const visibleColumns = useMemo(
		() =>
			columns
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
					fixedColumnKey: lockedColumns.includes(column.field)
						? Math.random().toString()
						: "",
				})),
		[columns, hiddenColumns, lockedColumns]
	);

	const [columnsState, setColumnsState] = useState<IDataGridColumnsState>({});

	// refresh data if desired
	useEffect(() => {
		if (rows !== null || dataLoadError !== null) return;

		let sorts = [];
		const fieldFilter: IDataGridFieldFilter = {};

		for (const field in columnsState) {
			if (!columnsState.hasOwnProperty(field)) continue;

			if (columnsState[field].sort !== 0) {
				sorts.push({
					field,
					...columnsState[field],
				});
			}

			const filter = columnsState[field].filter;
			if (filter && filter.value1) {
				fieldFilter[field] = filter;
			}
		}

		sorts = sorts
			.sort((a, b) => a.sortOrder! - b.sortOrder!)
			.map((col) => ({ field: col.field, direction: col.sort as -1 | 1 }));

		loadData(pageIndex + 1, rowsPerPage, search, {}, fieldFilter, sorts)
			.then((newRows) => {
				setState((prevState) => ({
					...prevState,
					rows: newRows,
				}));
			})
			.catch((err) => {
				setState((prevState) => ({
					...prevState,
					dataLoadError: err,
				}));
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rows, dataLoadError]);

	// instant refresh on pagination change
	const refresh = useCallback(
		() =>
			setState((prevState) => ({
				...prevState,
				rows: null,
				dataLoadError: null,
			})),
		[setState]
	);

	useEffect(refresh, [pageIndex, rowsPerPage]);

	// debounced refresh on filter and sort changes
	const debouncedRefresh = useMemo(() => debounce(refresh, 500), [refresh]);

	useEffect(debouncedRefresh, [search, columnsState]);

	return (
		<Grid
			container
			direction={"column"}
			justify={"space-between"}
			alignItems={"stretch"}
			className={classes.wrapper}
		>
			<DataGridPropsContext.Provider value={props}>
				<DataGridStateContext.Provider value={statePack}>
					<Grid item>
						<Header />
					</Grid>
					<Grid item xs className={classes.middle}>
						<Settings columns={columns} />
						{rows === null && <Loader />}
						{rows !== null && rows.length === 0 && "No Data!"}
						{rows && (
							<Content
								columns={visibleColumns}
								rowsPerPage={state.rowsPerPage}
								columnState={columnsState}
								setColumnState={setColumnsState}
								rows={rows}
							/>
						)}
					</Grid>
					<Grid item>
						<Footer />
					</Grid>
				</DataGridStateContext.Provider>
			</DataGridPropsContext.Provider>
		</Grid>
	);
});

export default DataGrid;
