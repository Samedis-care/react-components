import {
	IDataGridColumnDef,
	useDataGridProps,
	useDataGridState,
	useDataGridStyles,
} from "../DataGrid";
import React, { Dispatch, SetStateAction, useCallback } from "react";
import { GridCellProps } from "react-virtualized/dist/es/Grid";
import ColumnHeader from "./ColumnHeader";
import SelectRow, { isSelected } from "./SelectRow";
import { Skeleton } from "@material-ui/lab";
import { combineClassNames } from "../../../utils";

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
	const {
		onEdit,
		prohibitMultiSelect,
		onRowDoubleClick,
		disableSelection,
	} = useDataGridProps();
	const [state, setState] = useDataGridState();
	const [hover, setHover] = props.hoverState;
	const id = state.rows[props.rowIndex - 1]?.id || "undefined";

	const toggleSelection = useCallback(() => {
		if (id === "undefined") return;
		setState((prevState) => ({
			...prevState,
			selectedRows: !prevState.selectedRows.includes(id)
				? prohibitMultiSelect
					? [id]
					: [...prevState.selectedRows, id]
				: prevState.selectedRows.filter((s) => s !== id),
		}));
	}, [setState, id, prohibitMultiSelect]);

	const editRecord = useCallback(() => {
		if (id === "undefined") return;
		if (onRowDoubleClick) onRowDoubleClick(id);
		if (onEdit) onEdit(id);
	}, [id, onRowDoubleClick, onEdit]);

	const column: IDataGridColumnDef | undefined =
		columns[columnIndex - (disableSelection ? 0 : 1)];

	let content: React.ReactNode = null;
	if (rowIndex === 0 && columnIndex === 0 && !disableSelection) {
		// empty
	} else if (rowIndex === 0) {
		// header
		content = <ColumnHeader column={column} />;
	} else if (columnIndex === 0 && !disableSelection) {
		content = <SelectRow id={id} />;
	} else {
		content =
			rowIndex - 1 in state.rows ? (
				state.rows[rowIndex - 1][column.field]
			) : (
				<Skeleton variant={"text"} />
			);

		// special handling for objects (Date, etc). use toString on them
		if (
			content &&
			typeof content === "object" &&
			!React.isValidElement(content) &&
			"toString" in content
		) {
			content = content.toString();
		}
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
			onClick={disableSelection ? undefined : toggleSelection}
			onDoubleClick={editRecord}
			className={combineClassNames([
				classes.cell,
				props.rowIndex !== 0 ? classes.dataCell : classes.headerCell,
				props.rowIndex !== 0 &&
					(props.rowIndex % 2 === 0 ? classes.rowEven : classes.rowOdd),
				props.rowIndex !== 0 && column && `column-${column.field}`,
				(hover == rowIndex ||
					isSelected(state.selectAll, state.selectedRows, id)) &&
					classes.dataCellSelected,
			])}
		>
			{content}
		</div>
	);
};

export default Cell;
