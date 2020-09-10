import React, { useCallback, useContext } from "react";
import {
	DataGridColumnsStateContext,
	DataGridDefaultState,
	DataGridPropsContext,
	DataGridStateContext,
} from "../index";
import { Hidden } from "@material-ui/core";
import ActionBarView from "./ActionBarView";
import ActionBarViewMobile from "./ActionBarViewMobile";

const ActionBar = () => {
	const [state, setState] = useContext(DataGridStateContext)!;
	const [, setColumnState] = useContext(DataGridColumnsStateContext)!;
	const { selectAll, selectedRows } = state;
	const gridProps = useContext(DataGridPropsContext)!;
	const { onAddNew, onEdit, onDelete } = gridProps;

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
		if (onEdit) onEdit(firstSelection!);
	}, [onEdit, firstSelection]);

	const handleDelete = useCallback(() => {
		if (onDelete) onDelete(selectAll, selectedRows);
	}, [onDelete, selectAll, selectedRows]);

	const handleReset = useCallback(() => {
		setState(DataGridDefaultState);
		setColumnState({});
	}, [setState, setColumnState]);

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
