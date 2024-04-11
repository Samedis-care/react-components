import React, { useCallback, useEffect, useState } from "react";
import isTouchDevice from "../../../utils/isTouchDevice";
import combineClassNames from "../../../utils/combineClassNames";
import { DataGridColumnHeaderContentWrapper, useDataGridColumnState, useDataGridColumnsWidthState, useDataGridProps, useDataGridRootRef, } from "../DataGrid";
import ColumnHeaderContent from "./ColumnHeaderContent";
export const HEADER_PADDING = 32; // px
export const applyColumnWidthLimits = (column, targetWidth) => {
    const { width } = column;
    const absMinWidth = HEADER_PADDING * (column.filterable ? 3 : 2);
    const wishMinWidth = (width && width[0]) || 0;
    const wishMaxWidth = (width && width[1]) || Number.MAX_SAFE_INTEGER;
    targetWidth = Math.max(targetWidth, absMinWidth, wishMinWidth);
    targetWidth = Math.min(targetWidth, wishMaxWidth);
    return targetWidth;
};
const FallbackColumnState = {
    sort: 0,
    sortOrder: undefined,
    filter: undefined,
};
const ColumnHeader = (props) => {
    const { column } = props;
    const { field, sortable, filterable } = column;
    const gridRoot = useDataGridRootRef();
    const [columnState, setColumnState] = useDataGridColumnState();
    const { sortLimit, classes } = useDataGridProps();
    const { sort, sortOrder, filter } = columnState[field] ?? FallbackColumnState;
    const [, setColumnWidthState] = useDataGridColumnsWidthState();
    const [dragging, setDragging] = useState(false);
    const onFilterChange = useCallback((field, newFilter) => {
        setColumnState((prevState) => ({
            ...prevState,
            [field]: {
                ...prevState[field],
                filter: newFilter,
            },
        }));
    }, [setColumnState]);
    const onSortChange = useCallback((field, newSort, additional) => {
        setColumnState((prevState) => {
            let newColumnState = {
                ...prevState,
                [field]: {
                    ...prevState[field],
                    sort: newSort,
                },
            };
            if (additional) {
                if (newSort === 0) {
                    // if disable sorting, adjust sort priority for others
                    Object.keys(prevState)
                        .filter((otherField) => prevState[otherField].sort !== 0 &&
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        prevState[field].sortOrder <
                            prevState[otherField].sortOrder)
                        .forEach((otherField) => {
                        newColumnState = {
                            ...newColumnState,
                            [otherField]: {
                                ...newColumnState[otherField],
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                sortOrder: newColumnState[otherField].sortOrder - 1,
                            },
                        };
                    });
                }
                else if (newSort === 1) {
                    // if enable sorting, set to highest order
                    const order = Object.keys(prevState).filter((otherField) => prevState[otherField].sort !== 0).length + 1;
                    newColumnState = {
                        ...newColumnState,
                        [field]: {
                            ...newColumnState[field],
                            sortOrder: order,
                        },
                    };
                    // if we reached the limit of max sorts we cancel this action
                    if (typeof sortLimit === "number" && order - 1 > sortLimit) {
                        return prevState;
                    }
                }
            }
            else {
                for (const key in newColumnState) {
                    if (key === field)
                        continue;
                    newColumnState[key].sort = 0;
                    newColumnState[key].sortOrder = undefined;
                }
                newColumnState[field].sortOrder = 1;
                // if sortLimit is null we cancel the operation
                if (typeof sortLimit === "number" && sortLimit === 0) {
                    return prevState;
                }
            }
            return newColumnState;
        });
    }, [sortLimit, setColumnState]);
    const startDrag = useCallback(() => setDragging(true), [setDragging]);
    const stopDrag = useCallback(() => setDragging(false), [setDragging]);
    const onDrag = useCallback((evt) => {
        if (!dragging)
            return;
        evt.preventDefault();
        const move = evt.movementX;
        setColumnWidthState((prevState) => ({
            ...prevState,
            [field]: applyColumnWidthLimits(column, prevState[field] + move),
        }));
    }, [column, dragging, field, setColumnWidthState]);
    const onColumnSortChange = useCallback((modKey) => {
        if (!sortable)
            return;
        if (sort !== 0 && modKey)
            onSortChange(field, 0, true);
        else if (sort === 0)
            onSortChange(field, 1, modKey);
        else if (sort === 1)
            onSortChange(field, -1, true);
        else if (sort === -1)
            onSortChange(field, 0, true);
    }, [sortable, field, sort, onSortChange]);
    const onColumnClick = useCallback((evt) => {
        onColumnSortChange(evt.shiftKey);
    }, [onColumnSortChange]);
    const onColumnLongClick = useCallback((evt) => {
        evt.preventDefault();
        onColumnSortChange(true);
    }, [onColumnSortChange]);
    const internalOnFilterChange = useCallback((newFilter) => onFilterChange(field, newFilter), [field, onFilterChange]);
    const autoResize = useCallback(() => {
        if (!gridRoot)
            return;
        let width = 0;
        gridRoot.querySelectorAll(".column-" + field).forEach((entry) => {
            const widthMeasurement = document.createElement("div");
            widthMeasurement.style.display = "inline";
            widthMeasurement.style.position = "absolute";
            widthMeasurement.style.left = "-99999px";
            widthMeasurement.style.height = getComputedStyle(entry).height;
            widthMeasurement.innerHTML = entry.innerHTML;
            document.body.appendChild(widthMeasurement);
            const entryWidth = widthMeasurement.clientWidth + HEADER_PADDING;
            document.body.removeChild(widthMeasurement);
            width = Math.max(width, entryWidth);
        });
        setColumnWidthState((prevState) => ({
            ...prevState,
            [field]: applyColumnWidthLimits(column, width),
        }));
    }, [column, field, gridRoot, setColumnWidthState]);
    useEffect(() => {
        document.addEventListener("mousemove", onDrag);
        document.addEventListener("mouseup", stopDrag);
        return () => {
            document.removeEventListener("mousemove", onDrag);
            document.removeEventListener("mouseup", stopDrag);
        };
    }, [onDrag, stopDrag]);
    return (React.createElement(DataGridColumnHeaderContentWrapper, { onClick: onColumnClick, onContextMenu: isTouchDevice() ? onColumnLongClick : undefined, className: combineClassNames([
            classes?.columnHeaderContentWrapper,
            filterable && "CcDataGrid-columnHeaderFilterable",
            "column-header-" + column.field,
        ]) },
        React.createElement(ColumnHeaderContent, { field: props.column.field, headerName: props.column.headerLabel ?? props.column.headerName, enableResize: true, startDrag: startDrag, autoResize: autoResize, sort: sort, sortOrder: sortOrder, filterable: !!filterable, filter: filter, onFilterChange: internalOnFilterChange, columnType: props.column.type, filterData: props.column.filterData })));
};
export default React.memo(ColumnHeader);
