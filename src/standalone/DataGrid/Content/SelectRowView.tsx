import React from "react";
import { DataGridSelectCheckbox, useDataGridProps } from "../DataGrid";

export interface IDataGridContentSelectRowViewProps {
	/**
	 * Is currently checked?
	 */
	checked: boolean;
	/**
	 * The row record ID
	 */
	id: string;
	/**
	 * Is the control disabled?
	 */
	disabled: boolean;
}

const SelectRowView = (props: IDataGridContentSelectRowViewProps) => {
	const { classes } = useDataGridProps();

	return (
		<DataGridSelectCheckbox
			disabled={props.disabled}
			checked={props.checked}
			className={classes?.selectCheckbox}
		/>
	);
};

export default React.memo(SelectRowView);
