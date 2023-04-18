var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useDataGridProps, useDataGridState, useDataGridStyles, } from "../DataGrid";
import React, { useCallback, useContext, } from "react";
import ColumnHeader from "./ColumnHeader";
import SelectRow, { isSelected } from "./SelectRow";
import { Skeleton } from "@mui/material";
import { combineClassNames } from "../../../utils";
export var CellContext = React.createContext(undefined);
export var useCellContext = function () {
    var ctx = useContext(CellContext);
    if (!ctx)
        throw new Error("CellContext not set");
    return ctx;
};
var Cell = function (props) {
    var classes = useDataGridStyles();
    var columnIndex = props.columnIndex, rowIndex = props.rowIndex;
    var _a = useCellContext(), columns = _a.columns, hoverState = _a.hoverState;
    var _b = useDataGridProps(), onEdit = _b.onEdit, prohibitMultiSelect = _b.prohibitMultiSelect, onRowDoubleClick = _b.onRowDoubleClick, disableSelection = _b.disableSelection, isSelectedHook = _b.isSelected, canSelectRow = _b.canSelectRow;
    var _c = useDataGridState(), state = _c[0], setState = _c[1];
    var hover = hoverState[0], setHover = hoverState[1];
    var record = state.rows[props.rowIndex - 1];
    var id = (record === null || record === void 0 ? void 0 : record.id) || "undefined";
    var toggleSelection = useCallback(function () {
        if (id === "undefined")
            return;
        setState(function (prevState) { return (__assign(__assign({}, prevState), { selectedRows: !prevState.selectedRows.includes(id)
                ? prohibitMultiSelect
                    ? [id]
                    : __spreadArray(__spreadArray([], prevState.selectedRows, true), [id], false)
                : prevState.selectedRows.filter(function (s) { return s !== id; }), selectionUpdatedByProps: false })); });
    }, [setState, id, prohibitMultiSelect]);
    var editRecord = useCallback(function () {
        if (id === "undefined" || !record)
            return;
        // Pass record on double click of row to supprt/choose any other field as ID
        if (onRowDoubleClick)
            onRowDoubleClick(record);
        if (onEdit)
            onEdit(id);
    }, [id, onRowDoubleClick, onEdit, record]);
    var column = columns[columnIndex - (disableSelection ? 0 : 1)];
    var content = null;
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
        content = record ? record[column.field] : React.createElement(Skeleton, { variant: "text" });
        // special handling for objects (Date, etc). use toString on them
        if (content &&
            typeof content === "object" &&
            !React.isValidElement(content) &&
            "toString" in content) {
            content = content.toString();
        }
    }
    var startHover = useCallback(function () {
        if (rowIndex === 0)
            return;
        setHover(rowIndex);
    }, [setHover, rowIndex]);
    var endHover = useCallback(function () {
        setHover(null);
    }, [setHover]);
    return (React.createElement("div", { style: props.style, onMouseEnter: startHover, onMouseLeave: endHover, onClick: disableSelection || !record || (canSelectRow && !canSelectRow(record))
            ? undefined
            : toggleSelection, onDoubleClick: editRecord, className: combineClassNames([
            classes.cell,
            props.rowIndex !== 0 ? classes.dataCell : classes.headerCell,
            props.rowIndex !== 0 &&
                (props.rowIndex % 2 === 0 ? classes.rowEven : classes.rowOdd),
            props.rowIndex !== 0 && column && "column-".concat(column.field),
            (hover == rowIndex ||
                isSelected(state.selectAll, state.selectedRows, record, isSelectedHook)) &&
                classes.dataCellSelected,
        ]) }, content));
};
export default Cell;
