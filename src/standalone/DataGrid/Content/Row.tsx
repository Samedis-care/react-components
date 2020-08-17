import React from "react";
import { TableRow } from "@material-ui/core";
import { DataGridRowData, IDataGridColumnProps } from "../index";
import { DataGridCell } from "./CustomCells";
import FixedCell from "./FixedCell";
import SelectRow from "./SelectRow";

export interface IDataGridRowProps extends IDataGridColumnProps {
	/**
	 * The data of the row
	 */
	data: DataGridRowData;
}

const Row = (props: IDataGridRowProps) => {
	return (
		<TableRow>
			<SelectRow id={props.data.id} />
			{props.columns.map((column) =>
				column.isLocked ? (
					<FixedCell key={column.field + column.fixedColumnKey}>
						{props.data[column.field]}
					</FixedCell>
				) : (
					<DataGridCell key={column.field}>
						{props.data[column.field]}
					</DataGridCell>
				)
			)}
		</TableRow>
	);
};

export default React.memo(Row);
