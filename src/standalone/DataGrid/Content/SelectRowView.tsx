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

const SelectRowView = (props: IDataGridContentSelectRowViewProps) => {
	const classes = useStyles();

	return (
		<SelectRowCell>
			<Checkbox
				checked={props.checked}
				onChange={props.onSelect}
				className={classes.selectCheckbox}
			/>
		</SelectRowCell>
	);
};

export default React.memo(SelectRowView);
