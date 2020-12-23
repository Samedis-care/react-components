import React from "react";
import { Checkbox } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

export interface IDataGridContentSelectRowViewProps {
	/**
	 * Is currently checked?
	 */
	checked: boolean;
	/**
	 * Update the checked state
	 * @param evt The change event, ignored
	 * @param newChecked The new checked state
	 */
	onSelect: (evt: React.ChangeEvent, newChecked: boolean) => void;
}

const useStyles = makeStyles({
	selectCheckbox: {
		padding: 0,
	},
});

const SelectRowView = (props: IDataGridContentSelectRowViewProps) => {
	const classes = useStyles();

	return (
		<Checkbox
			checked={props.checked}
			onChange={props.onSelect}
			className={classes.selectCheckbox}
		/>
	);
};

export default React.memo(SelectRowView);
