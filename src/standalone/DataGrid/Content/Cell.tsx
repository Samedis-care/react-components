import { IDataGridColumnDef, useDataGridState } from "../index";
import React from "react";
import { GridCellProps } from "react-virtualized/dist/es/Grid";
import ColumnHeader, { HEADER_PADDING } from "./ColumnHeader";
import SelectRow, { isSelected } from "./SelectRow";
import { makeStyles } from "@material-ui/core/styles";
import { Skeleton } from "@material-ui/lab";

export interface CellProps extends GridCellProps {
	/**
	 * The grid columns
	 */
	columns: IDataGridColumnDef[];
}

const useStyles = makeStyles((theme) => ({
	cell: {
		//borderRight: `1px ${theme.palette.divider} solid`,
		borderBottom: `1px ${theme.palette.background.paper} solid`,
		padding: `0 ${HEADER_PADDING / 2}px`,
	},
	headerCell: {
		borderRight: `1px ${theme.palette.divider} solid`,
	},
	dataCell: {
		padding: HEADER_PADDING / 2,
		backgroundColor: theme.palette.secondary.light,
	},
	dataCellSelected: {
		backgroundColor: theme.palette.secondary.main,
	},
}));

const Cell = (props: CellProps): React.ReactElement => {
	const classes = useStyles();
	const { columns } = props;
	const [state] = useDataGridState();
	const id = state.rows[props.rowIndex - 1]?.id || "undefined";

	let content: React.ReactNode = null;
	if (props.rowIndex === 0 && props.columnIndex === 0) {
		// empty
	} else if (props.rowIndex === 0) {
		// header
		content = <ColumnHeader column={columns[props.columnIndex - 1]} />;
	} else if (props.columnIndex === 0) {
		content = <SelectRow id={id} />;
	} else {
		content =
			props.rowIndex - 1 in state.rows ? (
				<div>
					{state.rows[props.rowIndex - 1][columns[props.columnIndex - 1].field]}
				</div>
			) : (
				<Skeleton variant={"text"} />
			);
	}

	return (
		<div
			style={props.style}
			className={
				classes.cell +
				" " +
				(props.rowIndex !== 0 ? classes.dataCell : classes.headerCell) +
				" " +
				(isSelected(state.selectAll, state.selectedRows, id)
					? classes.dataCellSelected
					: "")
			}
		>
			{content}
		</div>
	);
};

export default Cell;
