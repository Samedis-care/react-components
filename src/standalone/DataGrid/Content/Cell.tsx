import {
	DataGridCell,
	DataGridRowData,
	IDataGridColumnDef,
	useDataGridProps,
	useDataGridState,
} from "../DataGrid";
import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useContext,
} from "react";
import { GridChildComponentProps } from "react-window";
import ColumnHeader from "./ColumnHeader";
import SelectRow, { isSelected } from "./SelectRow";
import { Skeleton } from "@mui/material";
import combineClassNames from "../../../utils/combineClassNames";

export interface CellContextType {
	/**
	 * The grid columns
	 */
	columns: IDataGridColumnDef[];
	/**
	 * The hover state and set state action
	 */
	hoverState: [number | null, Dispatch<SetStateAction<number | null>>];
}
export const CellContext = React.createContext<CellContextType | undefined>(
	undefined,
);
export const useCellContext = () => {
	const ctx = useContext(CellContext);
	if (!ctx) throw new Error("CellContext not set");
	return ctx;
};

const Cell = (props: GridChildComponentProps): React.ReactElement => {
	const { columnIndex, rowIndex } = props;
	const { columns, hoverState } = useCellContext();
	const {
		onEdit,
		prohibitMultiSelect,
		onRowDoubleClick,
		disableSelection,
		isSelected: isSelectedHook,
		canSelectRow,
		classes,
	} = useDataGridProps();
	const [state, setState] = useDataGridState();
	const [hover, setHover] = hoverState;
	const record: DataGridRowData | undefined = state.rows[props.rowIndex - 1];
	const id = record?.id || "undefined";

	const toggleSelection = useCallback(() => {
		if (id === "undefined") return;
		setState((prevState) => ({
			...prevState,
			selectedRows: !prevState.selectedRows.includes(id)
				? prohibitMultiSelect
					? [id]
					: [...prevState.selectedRows, id]
				: prevState.selectedRows.filter((s) => s !== id),
			selectionUpdatedByProps: false,
		}));
	}, [setState, id, prohibitMultiSelect]);

	const editRecord = useCallback(() => {
		if (id === "undefined" || !record) return;
		// Pass record on double click of row to supprt/choose any other field as ID
		if (onRowDoubleClick) onRowDoubleClick(record);
		if (onEdit) onEdit(id);
	}, [id, onRowDoubleClick, onEdit, record]);

	const column: IDataGridColumnDef | undefined =
		columns[columnIndex - (disableSelection ? 0 : 1)];

	let content: React.ReactNode = null;
	if (rowIndex === 0 && columnIndex === 0 && !disableSelection) {
		// empty
	} else if (columnIndex === columns.length + (disableSelection ? 0 : 1)) {
		content = <React.Fragment />; // remaining width filler
	} else if (rowIndex === 0) {
		// header
		content = <ColumnHeader column={column} />;
	} else if (columnIndex === 0 && !disableSelection) {
		content = record ? (
			<SelectRow record={record} />
		) : (
			<Skeleton variant="rectangular" />
		);
	} else {
		const content2 = record ? (
			record[column.field]
		) : (
			<Skeleton variant={"text"} />
		);

		// special handling for objects (Date, etc). use toString on them
		if (
			content2 &&
			typeof content2 === "object" &&
			!React.isValidElement(content2) &&
			"toString" in content2
		) {
			content = content2.toString();
		} else {
			content = content2;
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
		<DataGridCell
			style={props.style}
			onMouseEnter={startHover}
			onMouseLeave={endHover}
			onClick={
				disableSelection || !record || (canSelectRow && !canSelectRow(record))
					? undefined
					: toggleSelection
			}
			onDoubleClick={editRecord}
			className={combineClassNames([
				classes?.cell,
				props.rowIndex !== 0 ? "CcDataGrid-dataCell" : "CcDataGrid-headerCell",
				props.rowIndex !== 0 &&
					(props.rowIndex % 2 === 0
						? "CcDataGrid-rowEven"
						: "CcDataGrid-rowOdd"),
				props.rowIndex !== 0 && column && `column-${column.field}`,
				(hover == rowIndex ||
					isSelected(
						state.selectAll,
						state.selectedRows,
						record,
						isSelectedHook,
					)) &&
					"CcDataGrid-dataCellSelected",
			])}
		>
			{content}
		</DataGridCell>
	);
};

export default Cell;
