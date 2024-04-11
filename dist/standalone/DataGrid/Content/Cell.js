import { DataGridCell, useDataGridProps, useDataGridState, } from "../DataGrid";
import React, { useCallback, useContext, } from "react";
import ColumnHeader from "./ColumnHeader";
import SelectRow, { isSelected } from "./SelectRow";
import { Skeleton } from "@mui/material";
import combineClassNames from "../../../utils/combineClassNames";
export const CellContext = React.createContext(undefined);
export const useCellContext = () => {
    const ctx = useContext(CellContext);
    if (!ctx)
        throw new Error("CellContext not set");
    return ctx;
};
const Cell = (props) => {
    const { columnIndex, rowIndex } = props;
    const { columns, hoverState } = useCellContext();
    const { onEdit, prohibitMultiSelect, onRowDoubleClick, disableSelection, isSelected: isSelectedHook, canSelectRow, classes, } = useDataGridProps();
    const [state, setState] = useDataGridState();
    const [hover, setHover] = hoverState;
    const record = state.rows[props.rowIndex - 1];
    const id = record?.id || "undefined";
    const toggleSelection = useCallback(() => {
        if (id === "undefined")
            return;
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
        if (id === "undefined" || !record)
            return;
        // Pass record on double click of row to supprt/choose any other field as ID
        if (onRowDoubleClick)
            onRowDoubleClick(record);
        if (onEdit)
            onEdit(id);
    }, [id, onRowDoubleClick, onEdit, record]);
    const column = columns[columnIndex - (disableSelection ? 0 : 1)];
    let content = null;
    if (rowIndex === 0 && columnIndex === 0 && !disableSelection) {
        // empty
    }
    else if (columnIndex === columns.length + (disableSelection ? 0 : 1)) {
        content = React.createElement(React.Fragment, null); // remaining width filler
    }
    else if (rowIndex === 0) {
        // header
        content = React.createElement(ColumnHeader, { column: column });
    }
    else if (columnIndex === 0 && !disableSelection) {
        content = record ? (React.createElement(SelectRow, { record: record })) : (React.createElement(Skeleton, { variant: "rectangular" }));
    }
    else {
        const content2 = record ? (record[column.field]) : (React.createElement(Skeleton, { variant: "text" }));
        // special handling for objects (Date, etc). use toString on them
        if (content2 &&
            typeof content2 === "object" &&
            !React.isValidElement(content2) &&
            "toString" in content2) {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            content = content2.toString();
        }
        else {
            content = content2;
        }
    }
    const startHover = useCallback(() => {
        if (rowIndex === 0)
            return;
        setHover(rowIndex);
    }, [setHover, rowIndex]);
    const endHover = useCallback(() => {
        setHover(null);
    }, [setHover]);
    return (React.createElement(DataGridCell, { style: props.style, onMouseEnter: startHover, onMouseLeave: endHover, onClick: disableSelection || !record || (canSelectRow && !canSelectRow(record))
            ? undefined
            : toggleSelection, onDoubleClick: editRecord, className: combineClassNames([
            classes?.cell,
            props.rowIndex !== 0 ? "CcDataGrid-dataCell" : "CcDataGrid-headerCell",
            props.rowIndex !== 0 &&
                (props.rowIndex % 2 === 0
                    ? "CcDataGrid-rowEven"
                    : "CcDataGrid-rowOdd"),
            props.rowIndex !== 0 && column && `column-${column.field}`,
            (hover == rowIndex ||
                isSelected(state.selectAll, state.selectedRows, record, isSelectedHook)) &&
                "CcDataCell-dataCellSelected",
        ]) }, content));
};
export default Cell;
