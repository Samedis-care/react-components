import React, { useCallback, useContext } from "react";
import { DataGridStateContext } from "../index";
import SelectAllView from "./SelectAllView";

const SelectAll = () => {
	const [state, setState] = useContext(DataGridStateContext)!;

	const onSelect = useCallback(
		(_: any, newChecked: boolean) => {
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
