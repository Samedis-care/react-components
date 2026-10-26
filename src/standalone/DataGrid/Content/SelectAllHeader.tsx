import React from "react";
import {
	DataGridSelectAllHeader,
	useDataGridProps,
	useDataGridSelectAll,
} from "../DataGrid";
import SelectAllView from "../Footer/SelectAllView";

/**
 * The select all checkbox in the header of the selection column, the same
 * control as the one in the footer
 */
const SelectAllHeader = () => {
	const { classes } = useDataGridProps();
	const { checked, indeterminate, busy, disabled, label, onSelect } =
		useDataGridSelectAll();

	return (
		<DataGridSelectAllHeader className={classes?.selectAllHeader}>
			<SelectAllView
				disabled={disabled}
				checked={checked}
				indeterminate={indeterminate}
				busy={busy}
				label={label}
				onSelect={onSelect}
			/>
		</DataGridSelectAllHeader>
	);
};

export default React.memo(SelectAllHeader);
