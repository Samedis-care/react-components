import React from "react";
import { IDataGridColumnProps } from "../index";
import { Checkbox, TableHead, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ColumnHeader from "./ColumnHeader";
import { SelectAllCell } from "./CustomCells";

const useStyles = makeStyles({
	selectCheckbox: {
		padding: 0,
	},
});

export default React.memo((props: IDataGridColumnProps) => {
	const classes = useStyles();

	return (
		<TableHead>
			<TableRow>
				<SelectAllCell>
					<Checkbox className={classes.selectCheckbox} />
				</SelectAllCell>
				{props.columns.map((column) => (
					<ColumnHeader key={column.field} column={column} />
				))}
			</TableRow>
		</TableHead>
	);
});
