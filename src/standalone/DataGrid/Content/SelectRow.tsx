import React, { useMemo } from "react";
import {
	DataGridProps,
	DataGridRowData,
	IDataGridColumnDef,
	useDataGridProps,
	useDataGridState,
} from "../DataGrid";
import SelectRowView from "./SelectRowView";
import { getRowLabelDefault } from "./RowLabel";

export interface IDataGridContentSelectRowProps {
	/**
	 * The row record
	 */
	record: DataGridRowData;
	/**
	 * The visible columns, in the order they are shown
	 */
	columns: IDataGridColumnDef[];
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
	const { record, columns } = props;
	const [state] = useDataGridState();
	const {
		isSelected: isSelectedHook,
		canSelectRow,
		customSelectionControl,
		getRowLabel,
	} = useDataGridProps();
	const SelectRowControl = customSelectionControl || SelectRowView;
	const rowLabel = useMemo(
		() =>
			getRowLabel ? getRowLabel(record) : getRowLabelDefault(record, columns),
		[getRowLabel, record, columns],
	);

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
			rowLabel={rowLabel}
		/>
	);
};

export default React.memo(SelectRow);
