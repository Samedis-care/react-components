import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	DATA_GRID_DEFAULT_ROWS_PER_PAGE,
	DataGridSelectAll,
	DataGridSelectAllContext,
	IDataGridState,
	useDataGridColumnState,
	useDataGridProps,
	useDataGridState,
} from "./DataGrid";
import {
	DataGridFirstRows,
	dataGridGetQuery,
	dataGridLoadFirstRows,
} from "./CallbackUtil";
import useCCTranslations from "../../utils/useCCTranslations";

export interface DataGridSelectAllProviderProps {
	/**
	 * The grid parts showing the select all checkbox
	 */
	children: React.ReactNode;
}

/**
 * A limited select all loading its rows: the selection and the query it
 * started from, and what ends its load
 */
interface LimitedSelectAllLoad extends Pick<
	IDataGridState,
	"selectAll" | "selectedRows" | "refreshDataInstance"
> {
	/**
	 * Aborts the load: it requests no further page, and the signal loadData
	 * got aborts
	 */
	controller: AbortController;
}

/**
 * Provides the select all checkbox state (DataGridSelectAllContext), so the
 * checkbox in the footer and the one in the column header are one control
 */
const SelectAllProvider = (props: DataGridSelectAllProviderProps) => {
	const {
		enableSelectAll,
		limitSelectAll,
		prohibitMultiSelect,
		disableSelection,
		loadData,
		rowsPerPage,
		getAdditionalFilters,
		canSelectRow,
		onError,
	} = useDataGridProps();
	const [state, setState] = useDataGridState();
	const [columnsState] = useDataGridColumnState();
	const { t } = useCCTranslations();
	const {
		selectAll,
		selectedRows,
		limitedSelectAll,
		rows,
		search,
		customData,
		refreshDataInstance,
	} = state;
	// the limited select all loading its rows
	const [loading, setLoading] = useState<LimitedSelectAllLoad | null>(null);
	// that load while it is for the query the grid shows
	const load =
		loading?.refreshDataInstance === refreshDataInstance ? loading : null;
	// a reload or the unmount ends it, a later click too (onSelect). A row
	// (un)ticked meanwhile drops only the selection it would make: the rows it
	// loads still land in the grid
	useEffect(() => {
		if (!load) return;
		return () => load.controller.abort();
	}, [load]);

	const onSelect = useCallback(
		(_evt: React.ChangeEvent, newChecked: boolean) => {
			// a later click ends what an earlier one still loads
			loading?.controller.abort();
			if (limitSelectAll !== undefined && newChecked) {
				const controller = new AbortController();
				const { signal } = controller;
				const from: LimitedSelectAllLoad = {
					selectAll,
					selectedRows,
					refreshDataInstance,
					controller,
				};
				setLoading(from);
				void (async () => {
					let result: DataGridFirstRows;
					try {
						result = await dataGridLoadFirstRows(
							loadData,
							dataGridGetQuery(
								{ search, customData },
								columnsState,
								getAdditionalFilters,
							),
							rowsPerPage || DATA_GRID_DEFAULT_ROWS_PER_PAGE,
							rows,
							limitSelectAll,
							canSelectRow,
							signal,
						);
					} catch (err) {
						// ended meanwhile (this may be the abort itself): dropped
						if (signal.aborted) return;
						setLoading(null);
						// eslint-disable-next-line no-console
						console.error("[Components-Care] [DataGrid] Select all: ", err);
						if (onError) onError(err as Error);
						return;
					}
					if (signal.aborted) return;
					setLoading(null);
					const ids = result.rows.map((row) => row.id);
					setState((prevState) => {
						// the grid shows another query since
						if (prevState.refreshDataInstance !== refreshDataInstance)
							return prevState;
						const withRows = {
							...prevState,
							rows: { ...result.loadedRows, ...prevState.rows },
						};
						// the selection changed since the click: the later choice stays
						if (
							prevState.selectAll !== from.selectAll ||
							prevState.selectedRows !== from.selectedRows
						)
							return withRows;
						return {
							...withRows,
							selectAll: false,
							selectedRows: ids,
							limitedSelectAll: ids,
							selectionUpdatedByProps: false,
						};
					});
				})();
				return;
			}
			setLoading(null);
			// all or nothing: the rows (un)ticked one by one don't carry over, else
			// they would turn into the exceptions and invert the selection
			setState((prevState) => ({
				...prevState,
				selectAll: newChecked,
				selectedRows: [],
				selectionUpdatedByProps: false,
			}));
		},
		[
			limitSelectAll,
			loadData,
			search,
			customData,
			columnsState,
			getAdditionalFilters,
			rowsPerPage,
			rows,
			canSelectRow,
			onError,
			setState,
			refreshDataInstance,
			selectAll,
			selectedRows,
			loading,
		],
	);

	// until the selection or the query changes, which makes it drop the rows
	// it loads
	const busy =
		load !== null &&
		load.selectAll === selectAll &&
		load.selectedRows === selectedRows;
	// the rows the limited select all selected, in any order: a row unticked and
	// ticked again moves to the end
	const limitedSelected = useMemo(() => {
		if (
			!limitedSelectAll ||
			selectedRows.length === 0 ||
			selectedRows.length !== limitedSelectAll.length
		)
			return false;
		if (selectedRows === limitedSelectAll) return true;
		const selected = new Set(selectedRows);
		return limitedSelectAll.every((id) => selected.has(id));
	}, [selectedRows, limitedSelectAll]);
	const checked =
		busy || (selectAll ? selectedRows.length === 0 : limitedSelected);
	const indeterminate = !checked && selectedRows.length > 0;
	// disableSelection hides the footer's checkbox: hidden, it must not be
	// focused or ticked either
	const disabled =
		!enableSelectAll || !!prohibitMultiSelect || !!disableSelection;
	const limited =
		limitSelectAll !== undefined &&
		(state.rowsFiltered ?? state.rowsTotal) > limitSelectAll;
	const label = limited
		? t("standalone.data-grid.footer.select-first", { NUM: limitSelectAll })
		: t("standalone.data-grid.footer.select-all");

	const value = useMemo(
		(): DataGridSelectAll => ({
			checked,
			indeterminate,
			busy,
			disabled,
			label,
			onSelect,
		}),
		[checked, indeterminate, busy, disabled, label, onSelect],
	);

	return (
		<DataGridSelectAllContext.Provider value={value}>
			{props.children}
		</DataGridSelectAllContext.Provider>
	);
};

export default React.memo(SelectAllProvider);
