import React from "react";
import { Checkbox, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { IDataGridColumnProps } from "../index";
import { DataGridCell, SelectRowCell } from "./CustomCells";
import FixedCell from "./FixedCell";

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
			{props.columns.map((column, colIndex) =>
				column.isLocked ? (
					<FixedCell key={column.field}>Field {colIndex}</FixedCell>
				) : (
					<DataGridCell key={column.field}>Field {colIndex}</DataGridCell>
				)
			)}
		</TableRow>
	);
});
