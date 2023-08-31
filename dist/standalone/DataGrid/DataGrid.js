import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { Grid, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Header from "./Header";
import Footer from "./Footer";
import Settings from "./Settings";
import Content from "./Content";
import { debounce, isObjectEmpty, measureText, makeThemeStyles, useMultipleStyles, shallowCompareArray, } from "../../utils";
import { dataGridPrepareFiltersAndSorts } from "./CallbackUtil";
import { HEADER_PADDING } from "./Content/ColumnHeader";
import CustomFilterDialog from "./CustomFilterDialog";
import StatePersistence, { DataGridPersistentStateContext, } from "./StatePersistence";
import { suspend } from "suspend-react";
import { CustomFilterActiveContext } from "./Header/FilterBar";
const DataGridStateContext = React.createContext(undefined);
export const useDataGridState = () => {
    const ctx = useContext(DataGridStateContext);
    if (!ctx)
        throw new Error("State context not set");
    return ctx;
};
const DataGridPropsContext = React.createContext(undefined);
export const useDataGridProps = () => {
    const ctx = useContext(DataGridPropsContext);
    if (!ctx)
        throw new Error("Props context not set");
    return ctx;
};
const DataGridColumnsStateContext = React.createContext(undefined);
export const useDataGridColumnState = () => {
    const ctx = useContext(DataGridColumnsStateContext);
    if (!ctx)
        throw new Error("Columns state context not set");
    return ctx;
};
const DataGridColumnsWidthStateContext = React.createContext(undefined);
export const useDataGridColumnsWidthState = () => {
    const ctx = useContext(DataGridColumnsWidthStateContext);
    if (!ctx)
        throw new Error("Columns state width context not set");
    return ctx;
};
const DataGridRootRefContext = React.createContext(undefined);
export const useDataGridRootRef = () => {
    const ctx = useContext(DataGridRootRefContext);
    if (!ctx)
        throw new Error("RootRef context not set");
    return ctx;
};
export const getDataGridDefaultState = (columns, defaultCustomData) => ({
    search: "",
    rowsTotal: 0,
    rowsFiltered: null,
    showSettings: false,
    showFilterDialog: false,
    pages: [0, 0],
    hiddenColumns: columns.filter((col) => col.hidden).map((col) => col.field),
    lockedColumns: columns
        .filter((col) => col.pinned || col.forcePin)
        .map((col) => col.field),
    selectAll: false,
    selectedRows: [],
    selectionUpdatedByProps: false,
    rows: {},
    dataLoadError: null,
    refreshData: 1,
    refreshShouldWipeRows: false,
    customData: defaultCustomData ?? {},
    initialResize: false,
});
export const getDataGridDefaultColumnsState = (columns, defaultSort, defaultFilter) => {
    const data = {};
    columns.forEach((column) => {
        const defaultSortIndex = defaultSort?.findIndex((entry) => entry.field === column.field);
        const defaultFilterSetting = defaultFilter?.find((entry) => entry.field === column.field);
        data[column.field] = {
            sort: defaultSort && defaultSortIndex !== -1 && defaultSortIndex != null
                ? defaultSort[defaultSortIndex].direction
                : 0,
            sortOrder: defaultSortIndex != null && defaultSortIndex >= 0
                ? defaultSortIndex + 1
                : undefined,
            filter: defaultFilterSetting?.filter,
        };
    });
    return data;
};
const useStyles = makeStyles((theme) => ({
    wrapper: {
        width: theme.componentsCare?.dataGrid?.width || "100%",
        height: theme.componentsCare?.dataGrid?.height || "100%",
        flexGrow: 1,
        borderRadius: theme.componentsCare?.dataGrid?.borderRadius ||
            theme.shape.borderRadius,
        border: theme.componentsCare?.dataGrid?.border ||
            `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.componentsCare?.dataGrid?.backgroundColor ||
            theme.palette.background.paper,
        background: theme.componentsCare?.dataGrid?.background,
        ...theme.componentsCare?.dataGrid?.style,
    },
    header: {
        border: theme.componentsCare?.dataGrid?.header?.border ||
            `1px solid ${theme.palette.divider}`,
        borderWidth: theme.componentsCare?.dataGrid?.header?.borderWidth || "0 0 1px 0",
        padding: theme.componentsCare?.dataGrid?.header?.padding,
        background: theme.componentsCare?.dataGrid?.header?.background,
        backgroundColor: theme.componentsCare?.dataGrid?.header?.backgroundColor,
        ...theme.componentsCare?.dataGrid?.header?.style,
    },
    content: {
        position: "relative",
        margin: theme.componentsCare?.dataGrid?.content?.margin,
        padding: theme.componentsCare?.dataGrid?.content?.padding,
        border: theme.componentsCare?.dataGrid?.content?.border,
        borderWidth: theme.componentsCare?.dataGrid?.content?.borderWidth,
        background: theme.componentsCare?.dataGrid?.content?.background,
        backgroundColor: theme.componentsCare?.dataGrid?.content?.backgroundColor,
        ...theme.componentsCare?.dataGrid?.content?.style,
    },
    footer: {
        border: theme.componentsCare?.dataGrid?.footer?.border ||
            `1px solid ${theme.palette.divider}`,
        borderWidth: theme.componentsCare?.dataGrid?.footer?.borderWidth || "1px 0 0 0",
        padding: theme.componentsCare?.dataGrid?.footer?.padding,
        background: theme.componentsCare?.dataGrid?.footer?.background,
        backgroundColor: theme.componentsCare?.dataGrid?.footer?.backgroundColor,
        ...theme.componentsCare?.dataGrid?.footer?.style,
    },
    rowOdd: {
        background: theme.componentsCare?.dataGrid?.content?.row?.background,
        backgroundColor: theme.componentsCare?.dataGrid?.content?.row?.backgroundColor,
        padding: theme.componentsCare?.dataGrid?.content?.row?.padding,
        ...theme.componentsCare?.dataGrid?.content?.row?.odd,
    },
    rowEven: {
        background: theme.componentsCare?.dataGrid?.content?.row?.background,
        backgroundColor: theme.componentsCare?.dataGrid?.content?.row?.backgroundColor,
        padding: theme.componentsCare?.dataGrid?.content?.row?.padding,
        ...theme.componentsCare?.dataGrid?.content?.row?.even,
    },
    cell: {
        border: theme.componentsCare?.dataGrid?.content?.row?.cell?.data?.border ||
            theme.componentsCare?.dataGrid?.content?.row?.cell?.border ||
            `1px solid ${theme.componentsCare?.dataGrid?.content?.row?.cell?.data
                ?.borderColor ?? theme.palette.divider}`,
        borderWidth: theme.componentsCare?.dataGrid?.content?.row?.cell?.data?.borderWidth ||
            theme.componentsCare?.dataGrid?.content?.row?.cell?.borderWidth ||
            "0 1px 1px 0",
        padding: theme.componentsCare?.dataGrid?.content?.row?.cell?.data?.padding ||
            theme.componentsCare?.dataGrid?.content?.row?.cell?.padding ||
            `0 ${HEADER_PADDING / 2}px`,
        ...theme.componentsCare?.dataGrid?.content?.row?.cell?.data?.style,
    },
    headerCell: {
        border: theme.componentsCare?.dataGrid?.content?.row?.cell?.border ||
            theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.border,
        borderWidth: theme.componentsCare?.dataGrid?.content?.row?.cell?.borderWidth ||
            theme.componentsCare?.dataGrid?.content?.row?.cell?.header
                ?.borderWidth ||
            "0 1px 1px 0",
        padding: theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.padding ||
            theme.componentsCare?.dataGrid?.content?.row?.cell?.padding ||
            `0 ${HEADER_PADDING / 2}px`,
        backgroundColor: theme.componentsCare?.dataGrid?.content?.row?.cell?.header
            ?.backgroundColor || theme.palette.background.paper,
        color: theme.palette.getContrastText(theme.componentsCare?.dataGrid?.content?.row?.cell?.header
            ?.backgroundColor ?? theme.palette.background.paper),
        ...theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.style,
    },
    dataCell: {
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        "& > *": {
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
        },
        padding: HEADER_PADDING / 2,
        borderColor: theme.componentsCare?.dataGrid?.content?.row?.cell?.data?.borderColor ||
            theme.componentsCare?.dataGrid?.content?.row?.borderColor,
        color: theme.palette.getContrastText(theme.componentsCare?.dataGrid?.content?.backgroundColor ??
            theme.palette.background.paper),
        ...theme.componentsCare?.dataGrid?.content?.row?.cell?.data?.style,
    },
    dataCellSelected: {
        backgroundColor: theme.componentsCare?.dataGrid?.content?.row?.selected
            ?.backgroundColor || theme.palette.action.hover,
        color: theme.palette.getContrastText(theme.componentsCare?.dataGrid?.content?.row?.selected
            ?.backgroundColor ||
            theme.componentsCare?.dataGrid?.content?.backgroundColor ||
            theme.palette.background.paper),
        ...theme.componentsCare?.dataGrid?.content?.row?.selected?.style,
    },
    columnHeaderContentWrapper: {
        width: "100%",
        minWidth: "100%",
        zIndex: 1000,
        fontSize: theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
            ?.fontSize,
        fontWeight: theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
            ?.fontWeight,
        fontStyle: theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
            ?.fontStyle,
        border: theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
            ?.border ||
            `1px solid ${theme.componentsCare?.dataGrid?.content?.row?.cell?.borderColor ??
                theme.palette.divider}`,
        borderWidth: theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
            ?.borderWidth || "0 0 0 0",
        background: theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
            ?.background,
        backgroundColor: theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
            ?.backgroundColor,
        padding: theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
            ?.padding,
        ...theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.label
            ?.style,
    },
    columnHeaderFilterable: {
        color: theme.palette.primary.main,
    },
    columnHeaderFilterButton: {
        padding: 0,
        color: "inherit",
    },
    columnHeaderFilterButtonActive: {
        color: theme.palette.secondary.main,
    },
    columnHeaderResizer: {
        cursor: "col-resize",
        width: 8,
        height: "100%",
        right: 0,
        top: 0,
        position: "absolute",
        border: theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.resizer
            ?.border ||
            `1px solid ${theme.componentsCare?.dataGrid?.content?.row?.cell?.borderColor ??
                theme.palette.divider}`,
        borderWidth: theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.resizer
            ?.borderWidth || "0 0 0 0",
        background: theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.resizer
            ?.background,
        backgroundColor: theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.resizer
            ?.backgroundColor,
        ...theme.componentsCare?.dataGrid?.content?.row?.cell?.header?.resizer
            ?.style,
    },
    columnHeaderFilterPopup: {
        width: 160,
    },
    columnHeaderFilterIcon: {
        width: 16,
        height: "auto",
    },
    columnHeaderSortIcon: {
        height: 24,
    },
    quickFilterActiveIcon: {
        color: theme.palette.secondary.main,
    },
    customFilterIcon: {
        color: theme.palette.primary.main,
    },
    customFilterActiveIcon: {
        color: theme.palette.secondary.main,
    },
    customFilterBorder: {
        borderColor: theme.palette.secondary.main,
        "& > fieldset": {
            borderColor: theme.palette.secondary.main,
        },
    },
    columnHeaderLabel: {
        textOverflow: "ellipsis",
        overflow: "hidden",
        "&:hover": {
            pointerEvents: "auto",
        },
    },
    disableClick: {
        userSelect: "none",
    },
    filterClearBtn: {
        padding: 0,
    },
    filterBarBox: {
        height: "100%",
    },
    filterBarGrid: {
        height: `calc(100% + ${theme.spacing(2)})`,
        width: "100%",
    },
    setFilterContainer: {
        maxHeight: "40vh",
        overflow: "auto",
    },
    setFilterListItem: {
        paddingLeft: 0,
        paddingRight: 0,
    },
    setFilterListItemDivider: {
        padding: 0,
    },
    setFilterListDivider: {
        width: "100%",
    },
    contentOverlayCollapse: {
        position: "absolute",
        zIndex: 1000,
        width: "100%",
        maxHeight: "100%",
        overflow: "auto",
    },
    paginationText: {
        padding: "12px 0",
    },
    selectAllWrapper: {},
    selectAllCheckbox: {
        padding: "4px 0",
    },
    selectCheckbox: {
        padding: 0,
    },
    contentOverlayPaper: {
        padding: "0",
    },
    contentOverlayClosed: {
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.componentsCare?.dataGrid?.backgroundColor ||
            theme.palette.background.paper,
    },
    customFilterContainer: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
}), { name: "CcDataGrid" });
const useThemeStyles = makeThemeStyles((theme) => theme.componentsCare?.dataGridExpert, "CcDataGrid");
export const useDataGridStyles = () => {
    return useDataGridStylesInternal(useDataGridProps());
};
const useDataGridStylesInternal = (props) => {
    return useMultipleStyles(props, useThemeStyles, useStyles);
};
export const getActiveDataGridColumns = (columns, hiddenColumns, lockedColumns) => {
    return columns
        .filter((column) => !hiddenColumns.includes(column.field))
        .filter((column) => lockedColumns.includes(column.field))
        .concat(columns
        .filter((column) => !hiddenColumns.includes(column.field))
        .filter((column) => !lockedColumns.includes(column.field)))
        .map((column) => ({
        ...column,
        isLocked: lockedColumns.includes(column.field),
    }));
};
export const getDefaultColumnWidths = (columns, theme) => {
    const widthData = {};
    columns.forEach((column) => {
        try {
            widthData[column.field] =
                measureText(theme.typography.body1.font || "16px Roboto, sans-serif", column.headerName).width + 100;
        }
        catch (e) {
            // if canvas is not available to measure text
            widthData[column.field] = column.headerName.length * 16;
        }
        if (column.width) {
            // initial width
            if (column.width[2] !== undefined) {
                widthData[column.field] = column.width[2];
            }
            // min width
            widthData[column.field] = Math.max(column.width[0], widthData[column.field]);
            // max width
            widthData[column.field] = Math.min(column.width[1], widthData[column.field]);
        }
    });
    return widthData;
};
const DataGrid = (props) => {
    const { columns, loadData, getAdditionalFilters, forceRefreshToken, defaultCustomData, overrideCustomData, onSelectionChange, defaultSort, defaultFilter, disableFooter, disableSelection, headerHeight, selection, overrideFilter, globalScrollListener, } = props;
    const rowsPerPage = props.rowsPerPage || 25;
    const theme = useTheme();
    const persistedContext = useContext(DataGridPersistentStateContext);
    const [persistedPromise] = persistedContext || [];
    const persisted = suspend(() => Promise.resolve(persistedPromise), [
        persistedPromise,
    ]);
    const classes = useDataGridStylesInternal(props);
    const statePack = useState(() => ({
        ...getDataGridDefaultState(columns, undefined),
        ...persisted?.state,
        customData: overrideCustomData ??
            persisted?.state?.customData ??
            defaultCustomData ??
            {},
    }));
    const [state, setState] = statePack;
    const { search, rows, pages, hiddenColumns, lockedColumns, refreshData, customData, selectAll, selectedRows, selectionUpdatedByProps, } = state;
    const lastRefreshData = useRef(0);
    const activeCustomFiltersPack = useState(0);
    const gridRoot = useRef();
    const visibleColumns = useMemo(() => getActiveDataGridColumns(columns, hiddenColumns, lockedColumns), [columns, hiddenColumns, lockedColumns]);
    const columnsStatePack = useState(() => {
        const ret = {
            ...getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter),
            ...persisted?.columnState,
        };
        if (overrideFilter) {
            for (const field in ret) {
                ret[field].filter = undefined;
            }
            overrideFilter.forEach((override) => {
                if (override.field in ret) {
                    ret[override.field].filter = override.filter;
                }
            });
        }
        return ret;
    });
    const [columnsState] = columnsStatePack;
    const columnWidthStatePack = useState(() => ({
        ...getDefaultColumnWidths(columns, theme),
        ...persisted?.columnWidth,
    }));
    // update selection (if controlled)
    useEffect(() => {
        if (!selection)
            return;
        setState((prev) => {
            const stateEqual = prev.selectAll === selection[0] &&
                shallowCompareArray(prev.selectedRows, selection[1]);
            return stateEqual
                ? prev
                : {
                    ...prev,
                    selectAll: selection[0],
                    selectedRows: selection[1],
                    selectionUpdatedByProps: true,
                };
        });
    }, [setState, selection]);
    // refresh data if desired
    useEffect(() => {
        // we have an issue with a rare stuck loading bug. my assumption is that
        // React batches state updates and refreshData turns from 0 to 2 instantly
        // this causes a permanent loading screen because 1 is skipped
        const skippedFirstRefresh = lastRefreshData.current === 0 && refreshData === 2;
        lastRefreshData.current = refreshData;
        if (refreshData !== 1 && !skippedFirstRefresh) {
            return;
        }
        const [sorts, fieldFilter] = dataGridPrepareFiltersAndSorts(columnsState);
        void (async () => {
            for (let pageIndex = pages[0]; pageIndex <= pages[1]; pageIndex++) {
                // check if page was already loaded
                if (pageIndex * rowsPerPage in rows) {
                    continue;
                }
                try {
                    const data = await loadData({
                        page: pageIndex + 1,
                        rows: rowsPerPage,
                        quickFilter: search,
                        additionalFilters: getAdditionalFilters
                            ? getAdditionalFilters(state.customData)
                            : state.customData,
                        fieldFilter: fieldFilter,
                        sort: sorts,
                    });
                    const dataRowsTotal = data.rowsFiltered ?? data.rowsTotal;
                    // check if we are on an invalid page
                    if (pageIndex !== 0 &&
                        rowsPerPage !== 0 &&
                        dataRowsTotal !== 0 &&
                        data.rows.length === 0) {
                        const hasPartialPage = dataRowsTotal % rowsPerPage !== 0;
                        const newPage = ((dataRowsTotal / rowsPerPage) | 0) + (hasPartialPage ? 0 : -1);
                        // eslint-disable-next-line no-console
                        console.assert(newPage !== pageIndex, "[Components-Care] [DataGrid] Detected invalid page, but newly calculated page equals invalid page");
                        if (newPage !== pageIndex) {
                            setState((prevState) => ({
                                ...prevState,
                                pages: [newPage, newPage],
                            }));
                        }
                    }
                    const rowsAsObject = {};
                    for (let i = 0; i < data.rows.length; i++) {
                        rowsAsObject[pageIndex * rowsPerPage + i] = data.rows[i];
                    }
                    setState((prevState) => ({
                        ...prevState,
                        rowsTotal: data.rowsTotal,
                        rowsFiltered: data.rowsFiltered ?? null,
                        dataLoadError: null,
                        rows: Object.assign({}, prevState.rows, rowsAsObject),
                    }));
                }
                catch (err) {
                    // eslint-disable-next-line no-console
                    console.error("[Components-Care] [DataGrid] LoadData: ", err);
                    setState((prevState) => ({
                        ...prevState,
                        dataLoadError: err,
                        rowsFiltered: null,
                        rowsTotal: 0,
                    }));
                }
            }
            setState((prevState) => ({
                ...prevState,
                refreshData: prevState.refreshData - 1,
                // handle filter changes invalidating data
                rows: prevState.refreshShouldWipeRows && prevState.refreshData === 2
                    ? {}
                    : prevState.rows,
                selectedRows: prevState.refreshShouldWipeRows && prevState.refreshData === 2
                    ? []
                    : prevState.selectedRows,
                refreshShouldWipeRows: false,
            }));
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshData]);
    // instant refresh on pagination change
    const refresh = useCallback(() => setState((prevState) => ({
        ...prevState,
        refreshData: Math.min(prevState.refreshData + 1, 2),
    })), [setState]);
    // delay refresh call till useEffect has been processed, so we don't deadlock when auto page correction in the refresh
    // data function is performed.
    useLayoutEffect(refresh, [refresh, pages]);
    // debounced refresh on filter and sort changes
    const resetView = useMemo(() => debounce(() => {
        setState((prevState) => ({
            ...prevState,
            rows: {},
            selectedRows: [],
            refreshData: Math.min(prevState.refreshData + 1, 2),
            refreshShouldWipeRows: prevState.refreshData === 1, // when we set refreshData to two and this is changing filters, we need an rows reset to prevent old data from getting displayed
        }));
    }, 500), [setState]);
    const initialRender = useRef(true);
    useEffect(() => {
        // make sure we don't refresh data twice on initial render
        if (refreshData && isObjectEmpty(rows) && initialRender.current) {
            initialRender.current = false;
            return;
        }
        resetView();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetView, search, columnsState, customData, forceRefreshToken]);
    // selection change event
    useEffect(() => {
        // don't trigger selection update event when triggered by prop update
        if (selectionUpdatedByProps)
            return;
        if (onSelectionChange) {
            onSelectionChange(selectAll, selectedRows);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectAll, selectedRows]);
    return (React.createElement(Grid, { container: true, direction: "column", justifyContent: "space-between", alignItems: "stretch", wrap: "nowrap", className: classes.wrapper, ref: (r) => (gridRoot.current = r ? r : undefined) },
        React.createElement(DataGridRootRefContext.Provider, { value: gridRoot.current },
            React.createElement(DataGridPropsContext.Provider, { value: props },
                React.createElement(DataGridStateContext.Provider, { value: statePack },
                    React.createElement(DataGridColumnsStateContext.Provider, { value: columnsStatePack },
                        React.createElement(DataGridColumnsWidthStateContext.Provider, { value: columnWidthStatePack },
                            React.createElement(CustomFilterActiveContext.Provider, { value: activeCustomFiltersPack },
                                React.createElement(StatePersistence, null),
                                React.createElement(Grid, { item: true, className: classes.header },
                                    React.createElement(Header, null)),
                                React.createElement(Grid, { item: true, xs: true, className: classes.content },
                                    React.createElement(Settings, { columns: columns }),
                                    React.createElement(CustomFilterDialog, null),
                                    React.createElement(Content, { columns: visibleColumns, rowsPerPage: rowsPerPage, disableSelection: disableSelection, headerHeight: headerHeight, globalScrollListener: globalScrollListener })),
                                !disableFooter && (React.createElement(Grid, { item: true, className: classes.footer },
                                    React.createElement(Footer, null)))))))))));
};
export default React.memo(DataGrid);
