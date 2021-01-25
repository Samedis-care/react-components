import {
	IDataGridColumnDef,
	useDataGridState,
	useDataGridStyles,
} from "../index";
import React, { Dispatch, SetStateAction, useCallback } from "react";
import { GridCellProps } from "react-virtualized/dist/es/Grid";
import ColumnHeader from "./ColumnHeader";
import SelectRow, { isSelected } from "./SelectRow";
import { Skeleton } from "@material-ui/lab";

export interface CellProps extends GridCellProps {
	/**
	 * The grid columns
	 */
	columns: IDataGridColumnDef[];
	/**
	 * The hover state and set state action
	 */
	hoverState: [number | null, Dispatch<SetStateAction<number | null>>];
}

const Cell = (props: CellProps): React.ReactElement => {
	const classes = useDataGridStyles();
	const { columns, columnIndex, rowIndex } = props;
	const [state, setState] = useDataGridState();
	const [hover, setHover] = props.hoverState;
	const id = state.rows[props.rowIndex - 1]?.id || "undefined";

	const toggleSelection = useCallback(() => {
		if (id === "undefined") return;
		setState((prevState) => ({
			...prevState,
			selectedRows: !prevState.selectedRows.includes(id)
				? [...prevState.selectedRows, id]
				: prevState.selectedRows.filter((s) => s !== id),
		}));
	}, [setState, id]);

	let content: React.ReactNode = null;
	if (rowIndex === 0 && columnIndex === 0) {
		// empty
	} else if (rowIndex === 0) {
		// header
		content = <ColumnHeader column={columns[columnIndex - 1]} />;
	} else if (columnIndex === 0) {
		content = <SelectRow id={id} />;
	} else {
		const columnName = columns[columnIndex - 1].field;
		content =
			rowIndex - 1 in state.rows ? (
				<div className={`column-${columnName}`}>
					{state.rows[rowIndex - 1][columnName]}
				</div>
			) : (
				<Skeleton variant={"text"} />
			);
	}

	const startHover = useCallback(() => {
		if (rowIndex === 0) return;
		setHover(rowIndex);
	}, [setHover, rowIndex]);

	const endHover = useCallback(() => {
		setHover(null);
	}, [setHover]);

	return (
		<div
			style={props.style}
			onMouseEnter={startHover}
			onMouseLeave={endHover}
			onClick={toggleSelection}
			className={
				classes.cell +
				" " +
				(props.rowIndex !== 0 ? classes.dataCell : classes.headerCell) +
				" " +
				(isSelected(state.selectAll, state.selectedRows, id) ||
				hover == rowIndex
					? classes.dataCellSelected
					: "")
			}
		>
			{content}
		</div>
	);
};

export default Cell;
