import React from "react";
import { Checkbox } from "@material-ui/core";
import { SelectRowCell } from "./CustomCells";
import { makeStyles } from "@material-ui/core/styles";

export interface IDataGridContentSelectRowViewProps {
	checked: boolean;
	onSelect: (_: any, newChecked: boolean) => void;
}

const useStyles = makeStyles({
	selectCheckbox: {
		padding: 0,
	},
});

export default React.memo((props: IDataGridContentSelectRowViewProps) => {
	const classes = useStyles();

	return (
		<SelectRowCell>
			<Checkbox className={classes.selectCheckbox} />
		</SelectRowCell>
	);
});
