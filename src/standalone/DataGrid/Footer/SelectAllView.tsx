import React from "react";
import { DataGridSelectAllCheckbox, useDataGridProps } from "../DataGrid";

export interface IDataGridContentSelectAllViewProps {
	/**
	 * Is currently checked
	 */
	checked: boolean;
	/**
	 * Is the select all button disabled?
	 */
	disabled: boolean;
	/**
	 * Update checked
	 * @param evt The change event, ignored
	 * @param newChecked New checked state
	 */
	onSelect: (evt: React.ChangeEvent, newChecked: boolean) => void;
}

const SelectAllView = (props: IDataGridContentSelectAllViewProps) => {
	const { classes } = useDataGridProps();

	return (
		<DataGridSelectAllCheckbox
			className={classes?.selectAllCheckbox}
			checked={props.checked}
			onChange={props.onSelect}
			disabled={props.disabled}
		/>
	);
};

export default React.memo(SelectAllView);
