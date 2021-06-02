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
	const {
		getAdditionalFilters,
		customDataActionButtons,
		disableSelection,
	} = useDataGridProps();
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

	const handleDelete = useCallback(async () => {
		if (numSelected === 0) return;
		if (onDelete) {
			try {
				await onDelete(selectAll, selectedRows, {
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
			} catch (e) {
				// user cancelled
			}
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

	const handleCustomButtonCLick = useCallback(
		(label: string) => {
			if (!customDataActionButtons) return;
			const clickedButton = customDataActionButtons.find(
				(entry) => entry.label === label
			);
			if (!clickedButton) return;
			clickedButton.onClick(selectAll, selectedRows);
		},
		[customDataActionButtons, selectAll, selectedRows]
	);

	return (
		<Grid container>
			<DataActionBarView
				numSelected={Math.min(numSelected, 2) as 0 | 1 | 2}
				handleEdit={onEdit ? handleEdit : undefined}
				handleDelete={onDelete ? handleDelete : undefined}
				customButtons={customDataActionButtons}
				handleCustomButtonClick={handleCustomButtonCLick}
				disableSelection={!!disableSelection}
			/>
		</Grid>
	);
};

export default React.memo(DataActionBar);
