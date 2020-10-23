import React, { useCallback, useContext } from "react";
import {
	DataGridColumnsStateContext,
	DataGridPropsContext,
	DataGridStateContext,
	getDataGridDefaultState,
} from "../index";
import { Hidden } from "@material-ui/core";
import ActionBarView from "./ActionBarView";
import ActionBarViewMobile from "./ActionBarViewMobile";

const ActionBar = () => {
	const stateCtx = useContext(DataGridStateContext);
	if (!stateCtx) throw new Error("State Context not set");
	const [state, setState] = stateCtx;
	const columnsStateCtx = useContext(DataGridColumnsStateContext);
	if (!columnsStateCtx) throw new Error("Columns State Context not set");
	const [, setColumnState] = columnsStateCtx;
	const { selectAll, selectedRows } = state;
	const gridProps = useContext(DataGridPropsContext);
	if (!gridProps) throw new Error("Props Context not set");
	const { columns, onAddNew, onEdit, onDelete } = gridProps;

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
		? state.rows?.find((row) => !selectedRows.includes(row.id))?.id
		: selectedRows[0];
	const handleEdit = useCallback(() => {
		if (!firstSelection)
			throw new Error(
				"Calling handleEdit without selection? This shouldn't happen."
			);
		if (onEdit) onEdit(firstSelection);
	}, [onEdit, firstSelection]);

	const handleDelete = useCallback(() => {
		if (onDelete) onDelete(selectAll, selectedRows);
	}, [onDelete, selectAll, selectedRows]);

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
					exporters={gridProps.exporters}
					hasCustomFilterBar={!!gridProps.filterBar}
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
					exporters={gridProps.exporters}
					hasCustomFilterBar={!!gridProps.filterBar}
				/>
			</Hidden>
		</>
	);
};

export default React.memo(ActionBar);
