import React from "react";
import Checkbox from "../../UIKit/Checkbox";
import { useDataGridStyles } from "../DataGrid";

export interface IDataGridContentSelectRowViewProps {
	/**
	 * Is currently checked?
	 */
	checked: boolean;
	/**
	 * The row record ID
	 */
	id: string;
}

const SelectRowView = (props: IDataGridContentSelectRowViewProps) => {
	const classes = useDataGridStyles();

	return (
		<Checkbox checked={props.checked} className={classes.selectCheckbox} />
	);
};

export default React.memo(SelectRowView);
