import React from "react";
import { makeStyles } from "@material-ui/core";
import Checkbox from "../../UIKit/Checkbox";

export interface IDataGridContentSelectRowViewProps {
	/**
	 * Is currently checked?
	 */
	checked: boolean;
}

const useStyles = makeStyles({
	selectCheckbox: {
		padding: 0,
	},
});

const SelectRowView = (props: IDataGridContentSelectRowViewProps) => {
	const classes = useStyles();

	return (
		<Checkbox checked={props.checked} className={classes.selectCheckbox} />
	);
};

export default React.memo(SelectRowView);
