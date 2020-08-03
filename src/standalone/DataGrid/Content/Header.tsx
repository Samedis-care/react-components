import React from "react";
import { IDataGridColumnProps } from "../index";
import {
	Checkbox,
	createStyles,
	TableCell,
	TableHead,
	TableRow,
	Theme,
	withStyles,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ColumnHeader from "./ColumnHeader";

const selectAllCellStyles = createStyles((theme: Theme) => ({
	root: {
		position: "sticky",
		top: 0,
		left: 0,
		backgroundColor: theme.palette.background.paper,
		borderBottom: `1px solid ${theme.palette.divider}`,
		borderRight: `1px solid ${theme.palette.divider}`,
		zIndex: 1001,
	},
}));
const SelectAllCell = withStyles(selectAllCellStyles)(TableCell);

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
