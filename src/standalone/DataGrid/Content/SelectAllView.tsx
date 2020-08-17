import React from "react";
import { Checkbox } from "@material-ui/core";
import { SelectAllCell } from "./CustomCells";
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
	 * @param _ The change event, ignored
	 * @param newChecked New checked state
	 */
	onSelect: (_: any, newChecked: boolean) => void;
}

const SelectAllView = (props: IDataGridContentSelectAllViewProps) => {
	const classes = useStyles();

	return (
		<SelectAllCell>
			<Checkbox
				className={classes.selectCheckbox}
				checked={props.checked}
				onChange={props.onSelect}
			/>
		</SelectAllCell>
	);
};

export default React.memo(SelectAllView);
