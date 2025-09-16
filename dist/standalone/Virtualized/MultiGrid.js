import React, { useCallback, useEffect, useMemo, useRef, } from "react";
import { Grid as VGrid, } from "react-window";
import { styled, useThemeProps } from "@mui/material";
const Root = styled("div", { name: "CcMultiGrid", slot: "root" })({
    position: "relative",
});
const BottomLeftVariableSizeGrid = styled(VGrid, {
    name: "CcMultiGrid",
    slot: "bottomLeftGrid",
})({
    // in webkit based browsers:
    // hide the vertical scrollbar, sadly also removes the default styles
    // from the horizontal scrollbar
    "&::-webkit-scrollbar": {
        width: 0,
        height: "auto",
    },
    "&::-webkit-scrollbar-track": {
        background: "white",
    },
    "&::-webkit-scrollbar-thumb": {
        background: "hsl(0, 0%, 60%)",
    },
    // in firefox just hide it completely
    // we can do that because the scrollbar
    // doesn't add to the content width in firefox
    scrollbarWidth: "none",
});
const SCROLL_DETECTION_DELAY_MS = 100; // ms to consider scroll events caused by JS code
const MultiGrid = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcMultiGrid" });
    const { width, height, columnCount, columnWidth, rowCount, rowHeight, onCellsRendered, fixedColumnCount, fixedRowCount, styleTopLeftGrid, styleTopRightGrid, styleBottomLeftGrid, styleBottomRightGrid, children: CellRenderer, noContentRenderer: NoContentRenderer, globalScrollListener, } = props;
    const fixedWidth = useMemo(() => Array.from(new Array(fixedColumnCount).keys()).reduce((p, c) => p + columnWidth(c), 0), [columnWidth, fixedColumnCount]);
    const fixedHeight = useMemo(() => Array.from(new Array(fixedRowCount).keys()).reduce((p, c) => p + rowHeight(c), 0), [fixedRowCount, rowHeight]);
    const CellRendererTopRight = useCallback((props) => {
        return CellRenderer({
            ...props,
            columnIndex: props.columnIndex + fixedColumnCount,
        });
    }, [CellRenderer, fixedColumnCount]);
    const CellRendererBottomLeft = useCallback((props) => {
        return CellRenderer({
            ...props,
            rowIndex: props.rowIndex + fixedRowCount,
        });
    }, [CellRenderer, fixedRowCount]);
    const CellRendererBottomRight = useCallback((props) => {
        return CellRenderer({
            ...props,
            columnIndex: props.columnIndex + fixedColumnCount,
            rowIndex: props.rowIndex + fixedRowCount,
        });
    }, [CellRenderer, fixedColumnCount, fixedRowCount]);
    const handleCellsRendered = useCallback((visibleCells, allCells) => {
        if (!onCellsRendered)
            return;
        onCellsRendered({
            columnStartIndex: visibleCells.columnStartIndex + fixedColumnCount,
            columnStopIndex: visibleCells.columnStopIndex + fixedColumnCount,
            rowStartIndex: visibleCells.rowStartIndex + fixedRowCount,
            rowStopIndex: visibleCells.rowStopIndex + fixedRowCount,
        }, {
            columnStartIndex: allCells.columnStartIndex + fixedColumnCount,
            columnStopIndex: allCells.columnStopIndex + fixedColumnCount,
            rowStartIndex: allCells.rowStartIndex + fixedRowCount,
            rowStopIndex: allCells.rowStopIndex + fixedRowCount,
        });
    }, [fixedColumnCount, fixedRowCount, onCellsRendered]);
    const topLeftGrid = useRef(null);
    const topRightGrid = useRef(null);
    const bottomLeftGrid = useRef(null);
    const bottomRightGrid = useRef(null);
    const handleScrollPinnedRequested = useRef(null);
    const handleScrollRequested = useRef(null);
    const handleScroll = useCallback((evt) => {
        if (handleScrollRequested.current != null)
            return;
        if (handleScrollPinnedRequested.current)
            window.clearTimeout(handleScrollPinnedRequested.current);
        handleScrollPinnedRequested.current = window.setTimeout(() => {
            handleScrollPinnedRequested.current = null;
        }, SCROLL_DETECTION_DELAY_MS);
        topRightGrid.current?.element?.scrollTo({
            left: evt.currentTarget.scrollLeft,
        });
        bottomLeftGrid.current?.element?.scrollTo({
            top: evt.currentTarget.scrollTop,
        });
    }, []);
    const handleScrollPinned = useCallback((evt) => {
        if (handleScrollPinnedRequested.current != null)
            return;
        if (handleScrollRequested.current)
            window.clearTimeout(handleScrollRequested.current);
        handleScrollRequested.current = window.setTimeout(() => {
            handleScrollRequested.current = null;
        }, SCROLL_DETECTION_DELAY_MS);
        topLeftGrid.current?.element?.scrollTo({
            left: evt.currentTarget.scrollLeft,
        });
        bottomRightGrid.current?.element?.scrollTo({
            top: evt.currentTarget.scrollTop,
        });
    }, []);
    useEffect(() => {
        if (!globalScrollListener)
            return;
        const handleKeyPress = (evt) => {
            if (!["PageDown", "PageUp"].includes(evt.key))
                return;
            evt.preventDefault();
            const rightGrid = bottomRightGrid.current;
            const leftGrid = bottomLeftGrid.current;
            if (!rightGrid || !leftGrid)
                return;
            const scrollStep = height - fixedHeight;
            const scrollCurrent = rightGrid.element?.scrollTop ?? 0;
            if (evt.key === "PageDown") {
                rightGrid.element?.scrollTo({
                    top: scrollCurrent + scrollStep,
                });
            }
            else if (evt.key === "PageUp") {
                rightGrid.element?.scrollTo({
                    top: scrollCurrent - scrollStep,
                });
            }
        };
        document.addEventListener("keydown", handleKeyPress);
        return () => document.removeEventListener("keydown", handleKeyPress);
    }, [globalScrollListener, fixedHeight, height]);
    return (React.createElement(Root, { style: { width, height } },
        React.createElement(VGrid, { gridRef: topLeftGrid, columnWidth: (index) => columnWidth(index), rowHeight: (index) => rowHeight(index), columnCount: fixedColumnCount, rowCount: fixedRowCount, style: {
                ...styleTopLeftGrid,
                position: "absolute",
                top: 0,
                left: 0,
                width: Math.min(fixedWidth, width),
                height: fixedHeight,
            }, cellComponent: CellRenderer, cellProps: {} }),
        React.createElement(VGrid, { gridRef: topRightGrid, columnWidth: (index) => columnWidth(index + fixedColumnCount), rowHeight: (index) => rowHeight(index), columnCount: columnCount - fixedColumnCount, rowCount: fixedRowCount, style: {
                ...styleTopRightGrid,
                position: "absolute",
                top: 0,
                left: fixedWidth,
                width: Math.max(width - fixedWidth, 0),
                height: fixedHeight,
            }, cellComponent: CellRendererTopRight, cellProps: {} }),
        React.createElement(BottomLeftVariableSizeGrid, { gridRef: bottomLeftGrid, columnWidth: (index) => columnWidth(index), rowHeight: (index) => rowHeight(index + fixedRowCount), columnCount: fixedColumnCount, rowCount: rowCount - fixedRowCount, onScroll: handleScrollPinned, style: {
                ...styleBottomLeftGrid,
                position: "absolute",
                overflow: "scroll",
                top: fixedHeight,
                left: 0,
                width: Math.min(fixedWidth, width),
                height: height - fixedHeight,
            }, cellComponent: CellRendererBottomLeft, cellProps: {} }),
        rowCount - fixedRowCount > 0 ? (React.createElement(VGrid, { gridRef: bottomRightGrid, columnWidth: (index) => columnWidth(index + fixedColumnCount), rowHeight: (index) => rowHeight(index + fixedRowCount), columnCount: columnCount - fixedColumnCount, rowCount: rowCount - fixedRowCount, onScroll: handleScroll, style: {
                ...styleBottomRightGrid,
                overflowX: "scroll",
                overflowY: "auto",
                position: "absolute",
                top: fixedHeight,
                left: fixedWidth,
                width: Math.max(width - fixedWidth, 0),
                height: height - fixedHeight,
            }, onCellsRendered: onCellsRendered ? handleCellsRendered : undefined, cellComponent: CellRendererBottomRight, cellProps: {} })) : (React.createElement("div", { style: {
                ...styleBottomRightGrid,
                position: "absolute",
                top: fixedHeight,
                left: fixedWidth,
                width: width - fixedWidth,
                height: height - fixedHeight,
            } },
            React.createElement(NoContentRenderer, null)))));
};
export default React.memo(MultiGrid);
