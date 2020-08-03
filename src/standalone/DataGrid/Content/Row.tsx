import React from "react";
import {
	Checkbox,
	createStyles,
	TableCell,
	TableRow,
	Theme,
	withStyles,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { IDataGridColumnProps } from "../index";

const selectRowCellStyles = createStyles((theme: Theme) => ({
	root: {
		position: "sticky",
		left: 0,
		backgroundColor: theme.palette.background.paper,
		borderRight: `1px solid ${theme.palette.divider}`,
		zIndex: 1000,
	},
}));
const SelectRowCell = withStyles(selectRowCellStyles)(TableCell);
const dataGridCellStyles = createStyles((theme: Theme) => ({
	root: {
		borderRight: `1px solid ${theme.palette.divider}`,
	},
}));
const DataGridCell = withStyles(dataGridCellStyles)(TableCell);

const useStyles = makeStyles({
	selectCheckbox: {
		padding: 0,
	},
});

// tslint:disable-next-line:no-empty-interface
export interface IDataGridRowProps extends IDataGridColumnProps {}

export default React.memo((props: IDataGridRowProps) => {
	const classes = useStyles();

	return (
		<TableRow>
			<SelectRowCell>
				<Checkbox className={classes.selectCheckbox} />
			</SelectRowCell>
			{props.columns.map((column, colIndex) => (
				<DataGridCell key={column.field}>Field {colIndex}</DataGridCell>
			))}
		</TableRow>
	);
});
