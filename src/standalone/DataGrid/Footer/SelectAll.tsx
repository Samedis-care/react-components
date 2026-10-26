import React from "react";
import { useDataGridSelectAll } from "../DataGrid";
import SelectAllView from "./SelectAllView";

const SelectAll = () => {
	const { checked, indeterminate, busy, disabled, onSelect } =
		useDataGridSelectAll();

	return (
		<SelectAllView
			disabled={disabled}
			checked={checked}
			indeterminate={indeterminate}
			busy={busy}
			onSelect={onSelect}
		/>
	);
};

export default React.memo(SelectAll);
