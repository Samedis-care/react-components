import React, { useCallback, useEffect, useMemo, useState, } from "react";
import { useDataGridColumnsWidthState, useDataGridProps, useDataGridState, } from "../DataGrid";
import { AutoSizer } from "react-virtualized-auto-sizer";
import Cell, { CellContext } from "./Cell";
import { applyColumnWidthLimits } from "./ColumnHeader";
import Loader from "../../Loader";
import useCCTranslations from "../../../utils/useCCTranslations";
import CenteredTypography from "../../UIKit/CenteredTypography";
import MultiGrid from "../../Virtualized/MultiGrid";
import { Grid, styled } from "@mui/material";
import { useDataGridFiltersActive, useDataGridResetFilters, } from "../DataGridUtils";
import ActionButton from "../../UIKit/ActionButton";
import { Clear as ResetFilterIcon } from "@mui/icons-material";
const CenteredStickyTypography = styled(CenteredTypography, {
    name: "CcDataGrid",
    slot: "centeredStickyTypography",
})({
    position: "sticky",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
});
const SELECT_ROW_WIDTH = 57;
const DEFAULT_COLUMN_WIDTH = 200;
const STYLE_TOP_LEFT = { overflow: "hidden" };
const STYLE_BOTTOM_RIGHT = { outline: "none" };
const Content = (props) => {
    const { rowsPerPage, columns, disableSelection, headerHeight: headerHeightOverride, globalScrollListener, } = props;
    const headerHeight = headerHeightOverride ?? 32;
    const { classes } = useDataGridProps();
    const { t } = useCCTranslations();
    const [state, setState] = useDataGridState();
    const [columnWidth, setColumnWidth] = useDataGridColumnsWidthState();
    const [width, setWidth] = useState(0);
    const hoverState = useState(null);
    const { pages } = state;
    const onSectionRendered = useCallback((visibleCells) => {
        const pageStart = (visibleCells.rowStartIndex / rowsPerPage) | 0;
        const pageEnd = (visibleCells.rowStopIndex / rowsPerPage) | 0;
        if (pageStart !== pages[0] || pageEnd !== pages[1]) {
            setState((prevState) => ({
                ...prevState,
                pages: [pageStart, pageEnd],
            }));
        }
    }, [rowsPerPage, setState, pages]);
    const onResize = useCallback((size) => {
        setWidth(size.width);
    }, []);
    const scrollbarWidth = useMemo(() => {
        const scrollDiv = document.createElement("div");
        scrollDiv.style.width = "100px";
        scrollDiv.style.height = "100px";
        scrollDiv.style.overflow = "scroll";
        scrollDiv.style.position = "absolute";
        scrollDiv.style.top = "-101px";
        document.body.appendChild(scrollDiv);
        const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        document.body.removeChild(scrollDiv);
        return scrollbarWidth;
    }, []);
    const remainingWidth = useMemo(() => {
        const shownColumns = Object.keys(columnWidth)
            .map((field) => columns.find((col) => col.field === field))
            .filter((entry) => entry).filter((entry) => !state.hiddenColumns.includes(entry.field));
        const usedWidth = Object.entries(columnWidth)
            .filter(([field]) => shownColumns.find((col) => col.field === field))
            .reduce((a, b) => a + b[1], 0) +
            (disableSelection ? 0 : SELECT_ROW_WIDTH);
        return Math.max(width - usedWidth - scrollbarWidth, 0);
    }, [
        columnWidth,
        columns,
        disableSelection,
        state.hiddenColumns,
        width,
        scrollbarWidth,
    ]);
    useEffect(() => {
        if (width <= 0)
            return;
        if (state.initialResize)
            return;
        // only run on initial resize
        setColumnWidth((prevState) => {
            // resolve all visible columns which don't have an fixed initial width
            const shownColumns = Object.keys(prevState)
                .map((field) => columns.find((col) => col.field === field))
                .filter((entry) => entry).filter((entry) => !state.hiddenColumns.includes(entry.field));
            let columnsToResize = shownColumns.filter((entry) => !entry.width || !entry.width[2]);
            // determine width used by visible columns
            const usedWidth = Object.entries(prevState)
                .filter(([field]) => shownColumns.find((col) => col.field === field))
                .reduce((a, b) => a + b[1], 0) +
                (disableSelection ? 0 : SELECT_ROW_WIDTH);
            let remainingWidth = width - usedWidth - scrollbarWidth;
            if (remainingWidth <= 0)
                return prevState;
            // divide width over the visible columns while honoring limits
            const newState = { ...prevState };
            while (remainingWidth > 0) {
                const resizePerColumn = remainingWidth / columnsToResize.length;
                let newRemainingWidth = 0;
                columnsToResize.forEach((col) => {
                    if (!(col.field in newState))
                        return;
                    const newSize = applyColumnWidthLimits(col, newState[col.field] + resizePerColumn);
                    const widthDiff = newState[col.field] + resizePerColumn - newSize;
                    if (widthDiff !== 0) {
                        // remove the current column from the resizable list if we hit max-width
                        columnsToResize = columnsToResize.filter((altcol) => altcol.field !== col.field);
                    }
                    newRemainingWidth += widthDiff;
                    newState[col.field] = newSize;
                });
                remainingWidth = newRemainingWidth;
            }
            return newState;
        });
        setState((prev) => ({ ...prev, initialResize: true }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.initialResize, width]);
    const filtersActive = useDataGridFiltersActive();
    const resetFilters = useDataGridResetFilters();
    const noContentRenderer = useCallback(() => (React.createElement(React.Fragment, null, state.refreshData ? (React.createElement(Loader, null)) : state.dataLoadError ? (React.createElement(CenteredStickyTypography, { className: classes?.centeredStickyTypography, variant: "h5" }, state.dataLoadError.message)) : (React.createElement(CenteredStickyTypography, { className: classes?.centeredStickyTypography, variant: "h4" },
        React.createElement(Grid, { container: true, spacing: 2, direction: "column" },
            React.createElement(Grid, null, filtersActive
                ? t("standalone.data-grid.content.no-data-filters")
                : t("standalone.data-grid.content.no-data")),
            filtersActive && (React.createElement(Grid, null,
                React.createElement(ActionButton, { onClick: resetFilters, fullWidth: false, icon: React.createElement(ResetFilterIcon, null) }, t("standalone.data-grid.content.no-data-reset-filters"))))))))), [
        classes?.centeredStickyTypography,
        filtersActive,
        resetFilters,
        state.dataLoadError,
        state.refreshData,
        t,
    ]);
    const styleTopRightGrid = useMemo(() => ({
        overflow: "hidden",
        overflowX: (state.rowsFiltered ?? state.rowsTotal) === 0 ? "auto" : "hidden",
        overscrollBehavior: "contain",
        display: columns.length === 0 ? "none" : undefined,
    }), [columns.length, state.rowsFiltered, state.rowsTotal]);
    const styleBottomLeftGrid = useMemo(() => ({
        display: (state.rowsFiltered ?? state.rowsTotal) === 0 ? "none" : undefined,
    }), [state.rowsFiltered, state.rowsTotal]);
    const getRowHeight = useCallback((index) => (index === 0 ? headerHeight : 57), [headerHeight]);
    const getColumnWidth = useCallback((index) => !disableSelection && index === 0
        ? SELECT_ROW_WIDTH
        : index !== columns.length + (disableSelection ? 0 : 1)
            ? (columnWidth[columns[index - (disableSelection ? 0 : 1)].field] ??
                DEFAULT_COLUMN_WIDTH)
            : remainingWidth, [columnWidth, columns, disableSelection, remainingWidth]);
    const cellContextValue = useMemo(() => ({ columns, hoverState }), [columns, hoverState]);
    return (React.createElement(AutoSizer, { onResize: onResize, renderProp: ({ width = 0, height = 0 }) => (React.createElement(CellContext.Provider, { value: cellContextValue },
            React.createElement(MultiGrid, { columnCount: columns.length +
                    (disableSelection ? 0 : 1) +
                    (columns.length > 0 ? 1 : 0), columnWidth: getColumnWidth, rowCount: (state.rowsFiltered ?? state.rowsTotal) + 1, rowHeight: getRowHeight, width: width, height: height, onCellsRendered: onSectionRendered, fixedColumnCount: columns.filter((col) => col.isLocked).length +
                    (disableSelection ? 0 : 1), fixedRowCount: 1, styleTopLeftGrid: STYLE_TOP_LEFT, styleTopRightGrid: styleTopRightGrid, styleBottomLeftGrid: styleBottomLeftGrid, styleBottomRightGrid: STYLE_BOTTOM_RIGHT, noContentRenderer: noContentRenderer, globalScrollListener: globalScrollListener }, Cell))) }));
};
export default React.memo(Content);
