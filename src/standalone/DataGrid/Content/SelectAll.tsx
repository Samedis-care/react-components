import React, { useCallback } from "react";
import { useDataGridProps, useDataGridState } from "../index";
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
	const { enableDeleteAll } = useDataGridProps();
	const [state, setState] = useDataGridState();

	const onSelect = useCallback(
		(_evt: React.ChangeEvent, newChecked: boolean) => {
			setState((prevState) => ({
				...prevState,
				selectAll: enableDeleteAll ? newChecked : prevState.selectAll,
				selectedRows: enableDeleteAll
					? prevState.selectedRows
					: invertArray(
							prevState.selectedRows,
							Object.values(prevState.rows).map((e) => e.id) || []
					  ),
			}));
		},
		[setState, enableDeleteAll]
	);

	return <SelectAllView checked={state.selectAll} onSelect={onSelect} />;
};

export default React.memo(SelectAll);
