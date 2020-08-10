import React, { useCallback, useContext } from "react";
import { DataGridStateContext } from "../index";
import SelectRowView from "./SelectRowView";

export interface IDataGridContentSelectRowProps {
	id: string;
}

export default React.memo((props: IDataGridContentSelectRowProps) => {
	const { id } = props;
	const [state, setState] = useContext(DataGridStateContext)!;

	const onSelect = useCallback(
		(_: any, newSelected: boolean) => {
			setState((prevState) => ({
				...prevState,
				selectAll: prevState.selectAll,
				selectedRows: newSelected
					? [...prevState.selectedRows, id]
					: prevState.selectedRows.filter((s) => s !== id),
			}));
		},
		[setState, id]
	);

	return (
		<SelectRowView
			checked={
				state.selectAll
					? !state.selectedRows.includes(props.id)
					: state.selectedRows.includes(props.id)
			}
			onSelect={onSelect}
		/>
	);
});
