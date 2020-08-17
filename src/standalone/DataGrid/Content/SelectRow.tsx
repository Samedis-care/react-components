import React, { useCallback, useContext } from "react";
import { DataGridStateContext } from "../index";
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

const SelectRow = (props: IDataGridContentSelectRowProps) => {
	const { id } = props;
	const [state, setState] = useContext(DataGridStateContext)!;

	const onSelect = useCallback(
		(_: any, newSelected: boolean) => {
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
			checked={xor(state.selectAll, state.selectedRows.includes(props.id))}
			onSelect={onSelect}
		/>
	);
};

export default React.memo(SelectRow);
