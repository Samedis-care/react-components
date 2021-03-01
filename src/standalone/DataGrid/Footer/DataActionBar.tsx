import React, { useCallback } from "react";
import { Grid } from "@material-ui/core";
import {
	useDataGridColumnState,
	useDataGridProps,
	useDataGridState,
} from "../DataGrid";
import DataActionBarView from "./DataActionBarView";
import { dataGridPrepareFiltersAndSorts } from "../CallbackUtil";

const DataActionBar = () => {
	const [state, setState] = useDataGridState();
	const { search, customData } = state;
	const [columnState] = useDataGridColumnState();
	const { getAdditionalFilters } = useDataGridProps();
	const { selectAll, selectedRows } = state;
	const { onEdit, onDelete } = useDataGridProps();

	const numSelected = selectAll
		? state.rowsTotal - selectedRows.length
		: selectedRows.length;

	const firstSelection = selectAll
		? Object.values(state.rows).find((row) => !selectedRows.includes(row.id))
				?.id
		: selectedRows[0];
	const handleEdit = useCallback(() => {
		if (numSelected !== 1) return;
		if (!firstSelection)
			throw new Error(
				"Calling handleEdit without selection? This shouldn't happen."
			);
		if (onEdit) onEdit(firstSelection);
	}, [numSelected, onEdit, firstSelection]);

	const handleDelete = useCallback(() => {
		if (numSelected === 0) return;
		if (onDelete) {
			onDelete(selectAll, selectedRows, {
				quickFilter: search,
				fieldFilter: dataGridPrepareFiltersAndSorts(columnState)[1],
				additionalFilters: getAdditionalFilters
					? getAdditionalFilters(customData)
					: {},
			});
			setState((prevState) => ({
				...prevState,
				selectAll: false,
				selectedRows: [],
			}));
		}
	}, [
		numSelected,
		onDelete,
		selectAll,
		selectedRows,
		setState,
		search,
		columnState,
		getAdditionalFilters,
		customData,
	]);

	return (
		<Grid container>
			<DataActionBarView
				numSelected={Math.min(numSelected, 2)}
				handleEdit={onEdit ? handleEdit : undefined}
				handleDelete={onDelete ? handleDelete : undefined}
			/>
		</Grid>
	);
};

export default React.memo(DataActionBar);
