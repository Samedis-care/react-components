import React from "react";
import { TableRow } from "@material-ui/core";
import { IDataGridColumnProps } from "../index";
import { DataGridCell } from "./CustomCells";
import FixedCell from "./FixedCell";
import SelectRow from "./SelectRow";

// tslint:disable-next-line:no-empty-interface
export interface IDataGridRowProps extends IDataGridColumnProps {}

export default React.memo((props: IDataGridRowProps) => {
	return (
		<TableRow>
			<SelectRow />
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
