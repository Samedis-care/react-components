import React from "react";
import { useDataGridState } from "../index";
import SelectRowView from "./SelectRowView";

export interface IDataGridContentSelectRowProps {
	/**
	 * The ID of the row
	 */
	id: string;
}

const xor = (v1: boolean, v2: boolean): boolean => {
	return v1 ? !v2 : v2;
};

export const isSelected = (
	selectAll: boolean,
	selectedIds: string[],
	id: string
): boolean => xor(selectAll, selectedIds.includes(id));

const SelectRow = (props: IDataGridContentSelectRowProps) => {
	const { id } = props;
	const [state] = useDataGridState();

	return (
		<SelectRowView
			checked={isSelected(state.selectAll, state.selectedRows, id)}
		/>
	);
};

export default React.memo(SelectRow);
