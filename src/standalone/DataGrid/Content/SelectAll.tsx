import React, { useCallback, useContext } from "react";
import { DataGridPropsContext, DataGridStateContext } from "../index";
import SelectAllView from "./SelectAllView";

const invertArray = (arr: string[], entries: string[]): string[] => {
	const out: string[] = [];

	for (const elem of entries) {
		if (!arr.includes(elem)) {
			out.push(elem);
		}
	}

	for (const elem of arr) {
		if (!entries.includes(elem)) {
			out.push(elem);
		}
	}

	return out;
};

const SelectAll = () => {
	const propsCtx = useContext(DataGridPropsContext);
	if (!propsCtx) throw new Error("Props Context not set");
	const stateCtx = useContext(DataGridStateContext);
	if (!stateCtx) throw new Error("State Context not set");

	const { enableDeleteAll } = propsCtx;
	const [state, setState] = stateCtx;

	const onSelect = useCallback(
		(_evt: React.ChangeEvent, newChecked: boolean) => {
			setState((prevState) => ({
				...prevState,
				selectAll: enableDeleteAll ? newChecked : prevState.selectAll,
				selectedRows: enableDeleteAll
					? prevState.selectedRows
					: invertArray(
							prevState.selectedRows,
							prevState.rows?.map((e) => e.id) || []
					  ),
			}));
		},
		[setState, enableDeleteAll]
	);

	return <SelectAllView checked={state.selectAll} onSelect={onSelect} />;
};

export default React.memo(SelectAll);
