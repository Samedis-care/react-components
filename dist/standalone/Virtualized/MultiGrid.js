import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { Grid as VGrid, } from "react-window";
import { styled, useThemeProps } from "@mui/material";
const Root = styled("div", { name: "CcMultiGrid", slot: "root" })({
    position: "absolute",
});
// the scrolling pane is a tab stop, so it needs a visible focus indicator
const scrollPaneFocusRing = (theme) => ({
    "&:focus-visible": {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: -2,
    },
});
const TopRightVariableSizeGrid = styled(VGrid, {
    name: "CcMultiGrid",
    slot: "topRightGrid",
})(({ theme }) => scrollPaneFocusRing(theme));
const BottomLeftVariableSizeGrid = styled(VGrid, {
    name: "CcMultiGrid",
    slot: "bottomLeftGrid",
})({
    // scrolls with the body pane but shows no scrollbars of its own: its height
    // leaves out the body's horizontal scrollbar instead
    scrollbarWidth: "none",
    // Safari before 18.2 has no scrollbar-width
    "&::-webkit-scrollbar": {
        display: "none",
    },
});
const BottomRightVariableSizeGrid = styled(VGrid, {
    name: "CcMultiGrid",
    slot: "bottomRightGrid",
})(({ theme }) => scrollPaneFocusRing(theme));
const NO_SCROLLBARS = { vertical: 0, horizontal: 0 };
const SCROLL_DETECTION_DELAY_MS = 100; // ms to consider scroll events caused by JS code
const MultiGrid = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcMultiGrid" });
    const { width, height, columnCount, columnWidth, rowCount, rowHeight, onCellsRendered, fixedColumnCount, fixedRowCount, styleTopLeftGrid, styleTopRightGrid, styleBottomLeftGrid, styleBottomRightGrid, children: CellRenderer, noContentRenderer: NoContentRenderer, label, globalScrollListener, } = props;
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
    // The user cannot scroll the header pane while there are data rows
    // (overflow: hidden), but the browser scrolls it to reveal an element
    // focused in it, e.g. a column's filter button: the body follows.
    const handleScrollHeader = useCallback((evt) => {
        if (handleScrollPinnedRequested.current != null)
            return;
        if (handleScrollRequested.current)
            window.clearTimeout(handleScrollRequested.current);
        handleScrollRequested.current = window.setTimeout(() => {
            handleScrollRequested.current = null;
        }, SCROLL_DETECTION_DELAY_MS);
        bottomRightGrid.current?.element?.scrollTo({
            left: evt.currentTarget.scrollLeft,
        });
    }, []);
    // page up/down scrolls the grid from anywhere on the page, for the routes
    // where the grid *is* the page and there is nothing else to page
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
            const scrollStep = rightGrid.element?.clientHeight ?? 0;
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
    }, [globalScrollListener]);
    // restore horizontal scroll when bottom grid is enabled again
    const bottomRightRendered = rowCount - fixedRowCount > 0;
    const [triggerScrollSync, setTriggerScrollSync] = useState(false);
    useLayoutEffect(() => {
        if (!bottomRightRendered)
            return;
        setTriggerScrollSync(true);
    }, [bottomRightRendered]);
    useLayoutEffect(() => {
        if (!triggerScrollSync)
            return;
        const bottomGrid = bottomRightGrid.current?.element;
        const topGrid = topRightGrid.current?.element;
        if (!bottomGrid || !topGrid)
            return;
        bottomGrid.scrollLeft = topGrid.scrollLeft;
        setTriggerScrollSync(false);
    }, [triggerScrollSync]);
    // The header pane and the pinned column show no scrollbars, so they leave
    // out the room the body pane's scrollbars take (none with overlay
    // scrollbars, or while the body has nothing to scroll). All three then have
    // the same viewport and scroll range, and the header and the pinned column
    // follow the body to its last position.
    const [bodyPane, setBodyPane] = useState(null);
    const handleBottomRightGridRef = useCallback((grid) => {
        bottomRightGrid.current = grid;
        // react-window's element is null in its first render. The element of
        // an unmounted pane stays here until the next pane's arrives.
        if (grid?.element)
            setBodyPane(grid.element);
    }, []);
    const [bodyScrollbars, setBodyScrollbars] = useState(NO_SCROLLBARS);
    useLayoutEffect(() => {
        if (!bottomRightRendered || !bodyPane?.isConnected) {
            setBodyScrollbars(NO_SCROLLBARS);
            return;
        }
        const measure = () => {
            const vertical = bodyPane.offsetWidth - bodyPane.clientWidth;
            const horizontal = bodyPane.offsetHeight - bodyPane.clientHeight;
            setBodyScrollbars((prev) => prev.vertical === vertical && prev.horizontal === horizontal
                ? prev
                : { vertical, horizontal });
        };
        measure();
        // a scrollbar that comes or goes resizes the pane's content box, which
        // the observer reports like any other resize
        const Observer = bodyPane.ownerDocument.defaultView?.ResizeObserver;
        if (!Observer)
            return;
        const observer = new Observer(measure);
        observer.observe(bodyPane);
        return () => observer.disconnect();
    }, [bodyPane, bottomRightRendered]);
    return (_jsxs(Root, { style: { width, height }, children: [_jsx(VGrid, { gridRef: topLeftGrid, columnWidth: (index) => columnWidth(index), rowHeight: (index) => rowHeight(index), columnCount: fixedColumnCount, rowCount: fixedRowCount, style: {
                    ...styleTopLeftGrid,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: Math.min(fixedWidth, width),
                    height: fixedHeight,
                }, cellComponent: CellRenderer, cellProps: {} }), _jsx(TopRightVariableSizeGrid, { gridRef: topRightGrid, columnWidth: (index) => columnWidth(index + fixedColumnCount), rowHeight: (index) => rowHeight(index), columnCount: columnCount - fixedColumnCount, rowCount: fixedRowCount, 
                // without rows the bottom right pane doesn't exist and this one
                // takes over as the horizontal scroller, so it's the tab stop then
                tabIndex: bottomRightRendered ? undefined : 0, "aria-label": bottomRightRendered ? undefined : label, onScroll: handleScrollHeader, style: {
                    ...styleTopRightGrid,
                    // while there are data rows the body is the horizontal scroller
                    // and the header follows it
                    overflowX: bottomRightRendered ? "hidden" : "auto",
                    overflowY: "hidden",
                    position: "absolute",
                    top: 0,
                    left: fixedWidth,
                    width: Math.max(width - fixedWidth - bodyScrollbars.vertical, 0),
                    height: fixedHeight,
                }, cellComponent: CellRendererTopRight, cellProps: {} }), _jsx(BottomLeftVariableSizeGrid, { gridRef: bottomLeftGrid, columnWidth: (index) => columnWidth(index), rowHeight: (index) => rowHeight(index + fixedRowCount), columnCount: fixedColumnCount, rowCount: rowCount - fixedRowCount, onScroll: handleScrollPinned, style: {
                    ...styleBottomLeftGrid,
                    position: "absolute",
                    overflow: "scroll",
                    top: fixedHeight,
                    left: 0,
                    width: Math.min(fixedWidth, width),
                    height: Math.max(height - fixedHeight - bodyScrollbars.horizontal, 0),
                }, cellComponent: CellRendererBottomLeft, cellProps: {} }), bottomRightRendered ? (_jsx(BottomRightVariableSizeGrid, { gridRef: handleBottomRightGridRef, columnWidth: (index) => columnWidth(index + fixedColumnCount), rowHeight: (index) => rowHeight(index + fixedRowCount), columnCount: columnCount - fixedColumnCount, rowCount: rowCount - fixedRowCount, onScroll: handleScroll, 
                // the pane that actually scrolls in both directions: making it a
                // tab stop is what gives the grid a keyboard scrolling path, and
                // its onScroll keeps the two pinned panes in sync
                tabIndex: 0, "aria-label": label, style: {
                    ...styleBottomRightGrid,
                    overflowX: "auto",
                    overflowY: "auto",
                    position: "absolute",
                    top: fixedHeight,
                    left: fixedWidth,
                    width: Math.max(width - fixedWidth, 0),
                    height: height - fixedHeight,
                }, onCellsRendered: onCellsRendered ? handleCellsRendered : undefined, cellComponent: CellRendererBottomRight, cellProps: {} })) : (_jsx("div", { style: {
                    ...styleBottomRightGrid,
                    position: "absolute",
                    top: fixedHeight,
                    left: fixedWidth,
                    width: width - fixedWidth,
                    height: height - fixedHeight,
                }, children: _jsx(NoContentRenderer, {}) }))] }));
};
export default React.memo(MultiGrid);
