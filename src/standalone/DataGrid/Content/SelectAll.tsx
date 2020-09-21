import React, { useCallback, useContext } from "react";
import { DataGridStateContext } from "../index";
import SelectAllView from "./SelectAllView";

const SelectAll = () => {
	const stateCtx = useContext(DataGridStateContext);
	if (!stateCtx) throw new Error("State Context not set");
	const [state, setState] = stateCtx;

	const onSelect = useCallback(
		(_evt: React.ChangeEvent, newChecked: boolean) => {
			setState((prevState) => ({
				...prevState,
				selectAll: newChecked,
			}));
		},
		[setState]
	);

	return <SelectAllView checked={state.selectAll} onSelect={onSelect} />;
};

export default React.memo(SelectAll);
