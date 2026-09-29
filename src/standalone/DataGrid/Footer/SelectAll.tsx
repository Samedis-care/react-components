import React, { useCallback } from "react";
import { useDataGridProps, useDataGridState } from "../DataGrid";
import SelectAllView from "./SelectAllView";

const SelectAll = () => {
	const { enableSelectAll, prohibitMultiSelect } = useDataGridProps();
	const [state, setState] = useDataGridState();
	const { selectAll, selectedRows } = state;

	const onSelect = useCallback(
		(_evt: React.ChangeEvent, newChecked: boolean) => {
			// all or nothing: the rows (un)ticked one by one don't carry over, else
			// they would turn into the exceptions and invert the selection
			setState((prevState) => ({
				...prevState,
				selectAll: newChecked,
				selectedRows: [],
				selectionUpdatedByProps: false,
			}));
		},
		[setState],
	);

	return (
		<SelectAllView
			disabled={!enableSelectAll || !!prohibitMultiSelect}
			checked={selectAll && selectedRows.length === 0}
			indeterminate={selectedRows.length > 0}
			onSelect={onSelect}
		/>
	);
};

export default React.memo(SelectAll);
