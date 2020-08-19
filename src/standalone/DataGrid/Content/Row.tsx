import React, { useCallback, useContext } from "react";
import { TableRow } from "@material-ui/core";
import {
	DataGridPropsContext,
	DataGridRowData,
	IDataGridColumnProps,
} from "../index";
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
	const gridProps = useContext(DataGridPropsContext)!;
	const { onEdit } = gridProps;
	const { id } = props.data;
	const onDoubleClick = useCallback(() => {
		if (!onEdit) return;
		onEdit(id);
	}, [onEdit, id]);

	return (
		<TableRow>
			<SelectRow id={id} />
			{props.columns.map((column) =>
				column.isLocked ? (
					<FixedCell
						onDoubleClick={onDoubleClick}
						key={column.field + column.fixedColumnKey}
					>
						{props.data[column.field]}
					</FixedCell>
				) : (
					<DataGridCell onDoubleClick={onDoubleClick} key={column.field}>
						{props.data[column.field]}
					</DataGridCell>
				)
			)}
		</TableRow>
	);
};

export default React.memo(Row);
