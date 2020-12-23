import React, { useCallback } from "react";
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
): boolean => {
	return xor(selectAll, selectedIds.includes(id));
};

const SelectRow = (props: IDataGridContentSelectRowProps) => {
	const { id } = props;
	const [state, setState] = useDataGridState();

	const onSelect = useCallback(
		(_evt: React.ChangeEvent, newSelected: boolean) => {
			setState((prevState) => ({
				...prevState,
				selectedRows: xor(newSelected, prevState.selectAll)
					? [...prevState.selectedRows, id]
					: prevState.selectedRows.filter((s) => s !== id),
			}));
		},
		[setState, id]
	);

	return (
		<SelectRowView
			checked={isSelected(state.selectAll, state.selectedRows, props.id)}
			onSelect={onSelect}
		/>
	);
};

export default React.memo(SelectRow);
