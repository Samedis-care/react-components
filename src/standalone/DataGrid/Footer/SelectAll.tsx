import React, { useCallback } from "react";
import { useDataGridProps, useDataGridState } from "../DataGrid";
import SelectAllView from "./SelectAllView";

const SelectAll = () => {
	const { enableDeleteAll, prohibitMultiSelect } = useDataGridProps();
	const [state, setState] = useDataGridState();

	const onSelect = useCallback(
		(_evt: React.ChangeEvent, newChecked: boolean) => {
			setState((prevState) => ({
				...prevState,
				selectAll: newChecked,
				selectionUpdatedByProps: false,
			}));
		},
		[setState]
	);

	return (
		<SelectAllView
			disabled={!enableDeleteAll || !!prohibitMultiSelect}
			checked={state.selectAll}
			onSelect={onSelect}
		/>
	);
};

export default React.memo(SelectAll);
