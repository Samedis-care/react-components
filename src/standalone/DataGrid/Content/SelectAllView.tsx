import React from "react";
import { Checkbox } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
	selectCheckbox: {
		padding: 0,
	},
});

export interface IDataGridContentSelectAllViewProps {
	/**
	 * Is currently checked
	 */
	checked: boolean;
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
		/>
	);
};

export default React.memo(SelectAllView);
