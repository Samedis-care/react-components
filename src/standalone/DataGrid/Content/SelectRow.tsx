import React from "react";
import {
	DataGridProps,
	DataGridRowData,
	useDataGridProps,
	useDataGridState,
} from "../DataGrid";
import SelectRowView from "./SelectRowView";

export interface IDataGridContentSelectRowProps {
	/**
	 * The row record
	 */
	record: DataGridRowData;
}

const xor = (v1: boolean, v2: boolean): boolean => {
	return v1 ? !v2 : v2;
};

const isSelectedHookDefault = (selected: boolean): boolean => selected;
export const isSelected = (
	selectAll: boolean,
	selectedIds: string[],
	record?: Record<string, unknown>,
	isSelectedHook?: DataGridProps["isSelected"],
): boolean => {
	if (!record) return false;
	const result = xor(selectAll, selectedIds.includes(record.id as string));
	return (isSelectedHook ?? isSelectedHookDefault)(result, record);
};

const SelectRow = (props: IDataGridContentSelectRowProps) => {
	const { record } = props;
	const [state] = useDataGridState();
	const {
		isSelected: isSelectedHook,
		canSelectRow,
		customSelectionControl,
	} = useDataGridProps();
	const SelectRowControl = customSelectionControl || SelectRowView;

	return (
		<SelectRowControl
			checked={isSelected(
				state.selectAll,
				state.selectedRows,
				record,
				isSelectedHook,
			)}
			disabled={canSelectRow ? !canSelectRow(record) : false}
			id={record.id}
		/>
	);
};

export default React.memo(SelectRow);
