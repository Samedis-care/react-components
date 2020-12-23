import React, { useCallback } from "react";
import {
	getDataGridDefaultState,
	useDataGridColumnState,
	useDataGridProps,
	useDataGridState,
} from "../index";
import { Hidden } from "@material-ui/core";
import ActionBarView from "./ActionBarView";
import ActionBarViewMobile from "./ActionBarViewMobile";

const ActionBar = () => {
	const [state, setState] = useDataGridState();
	const [, setColumnState] = useDataGridColumnState();
	const { selectAll, selectedRows } = state;
	const {
		columns,
		onAddNew,
		onEdit,
		onDelete,
		exporters,
		filterBar,
	} = useDataGridProps();

	const toggleSettings = useCallback(() => {
		setState((prevState) => ({
			...prevState,
			showSettings: !prevState.showSettings,
		}));
	}, [setState]);

	const numSelected = selectAll
		? state.rowsTotal - selectedRows.length
		: selectedRows.length;

	const firstSelection = selectAll
		? Object.values(state.rows).find((row) => !selectedRows.includes(row.id))
				?.id
		: selectedRows[0];
	const handleEdit = useCallback(() => {
		if (!firstSelection)
			throw new Error(
				"Calling handleEdit without selection? This shouldn't happen."
			);
		if (onEdit) onEdit(firstSelection);
	}, [onEdit, firstSelection]);

	const handleDelete = useCallback(() => {
		if (onDelete) {
			onDelete(selectAll, selectedRows);
			setState((prevState) => ({
				...prevState,
				selectAll: false,
				selectedRows: [],
			}));
		}
	}, [onDelete, selectAll, selectedRows, setState]);

	const handleReset = useCallback(() => {
		setState(getDataGridDefaultState(columns));
		setColumnState({});
	}, [setState, setColumnState, columns]);

	return (
		<>
			<Hidden xsDown implementation={"js"}>
				<ActionBarView
					toggleSettings={toggleSettings}
					numSelected={Math.min(numSelected, 2)}
					handleAddNew={onAddNew}
					handleEdit={onEdit ? handleEdit : undefined}
					handleDelete={onDelete ? handleDelete : undefined}
					handleReset={handleReset}
					exporters={exporters}
					hasCustomFilterBar={!!filterBar}
				/>
			</Hidden>
			<Hidden smUp implementation={"js"}>
				<ActionBarViewMobile
					toggleSettings={toggleSettings}
					numSelected={Math.min(numSelected, 2)}
					handleAddNew={onAddNew}
					handleEdit={onEdit ? handleEdit : undefined}
					handleDelete={onDelete ? handleDelete : undefined}
					handleReset={handleReset}
					exporters={exporters}
					hasCustomFilterBar={!!filterBar}
				/>
			</Hidden>
		</>
	);
};

export default React.memo(ActionBar);
