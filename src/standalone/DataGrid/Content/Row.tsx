import React, { useCallback, useContext } from "react";
import { TableRow } from "@material-ui/core";
import {
	DataGridPropsContext,
	DataGridRowData,
	IDataGridColumnProps,
} from "../index";
import { DataGridCell, SpacingCell } from "./CustomCells";
import FixedCell from "./FixedCell";
import SelectRow from "./SelectRow";
import { makeStyles } from "@material-ui/core/styles";
import { combineColors } from "../../../utils";

export interface IDataGridRowProps extends IDataGridColumnProps {
	/**
	 * The data of the row
	 */
	data: DataGridRowData;
}

const useStyles = makeStyles((theme) => ({
	rowHover: {
		backgroundColor: theme.palette.background.paper,
		"&:hover": {
			backgroundColor: `rgba(${combineColors(
				theme.palette.background.paper,
				theme.palette.action.hover
			).join()})`,
		},
	},
}));

const Row = (props: IDataGridRowProps) => {
	const gridProps = useContext(DataGridPropsContext);
	if (!gridProps) throw new Error("Props Context not set");
	const { onEdit } = gridProps;
	const { id } = props.data;
	const classes = useStyles();

	const onDoubleClick = useCallback(() => {
		if (!onEdit) return;
		onEdit(id);
	}, [onEdit, id]);

	return (
		<TableRow className={classes.rowHover}>
			<SelectRow id={id} />
			{props.columns.map((column) =>
				column.isLocked ? (
					<FixedCell
						onDoubleClick={onDoubleClick}
						key={`${column.field}${column.fixedColumnKey || ""}`}
					>
						{props.data[column.field]}
					</FixedCell>
				) : (
					<DataGridCell onDoubleClick={onDoubleClick} key={column.field}>
						{props.data[column.field]}
					</DataGridCell>
				)
			)}
			<SpacingCell />
		</TableRow>
	);
};

export default React.memo(Row);
