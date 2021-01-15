import React from "react";
import { makeStyles } from "@material-ui/core";
import Checkbox from "../../UIKit/Checkbox";

const useStyles = makeStyles({
	selectCheckbox: {
		padding: "4px 0",
	},
});

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
	const classes = useStyles();

	return (
		<Checkbox
			className={classes.selectCheckbox}
			checked={props.checked}
			onChange={props.onSelect}
			disabled={props.disabled}
		/>
	);
};

export default React.memo(SelectAllView);
