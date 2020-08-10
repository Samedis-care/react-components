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
	checked: boolean;
	onSelect: (_: any, newChecked: boolean) => void;
}

export default React.memo((props: IDataGridContentSelectAllViewProps) => {
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
});
