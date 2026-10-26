import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import { DATA_GRID_DEFAULT_ROWS_PER_PAGE, DataGridSelectAllContext, useDataGridColumnState, useDataGridProps, useDataGridState, } from "./DataGrid";
import { dataGridGetQuery, dataGridLoadFirstRows, } from "./CallbackUtil";
import useCCTranslations from "../../utils/useCCTranslations";
/**
 * Provides the select all checkbox state (DataGridSelectAllContext), so the
 * checkbox in the footer and the one in the column header are one control
 */
const SelectAllProvider = (props) => {
    const { enableSelectAll, limitSelectAll, prohibitMultiSelect, loadData, rowsPerPage, getAdditionalFilters, canSelectRow, onError, } = useDataGridProps();
    const [state, setState] = useDataGridState();
    const [columnsState] = useDataGridColumnState();
    const { t } = useCCTranslations();
    const { selectAll, selectedRows, limitedSelectAll, rows, search, customData, refreshDataInstance, } = state;
    // the selection a limited select all started from while it loads its rows
    const [loadingFrom, setLoadingFrom] = useState(null);
    // counts the clicks: a later click, or the unmount, drops what an earlier
    // click still loads
    const clicks = useRef(0);
    useEffect(() => () => {
        clicks.current++;
    }, []);
    const onSelect = useCallback((_evt, newChecked) => {
        const click = ++clicks.current;
        if (limitSelectAll !== undefined && newChecked) {
            const from = { selectAll, selectedRows };
            setLoadingFrom(from);
            void (async () => {
                let result;
                try {
                    result = await dataGridLoadFirstRows(loadData, dataGridGetQuery({ search, customData }, columnsState, getAdditionalFilters), rowsPerPage || DATA_GRID_DEFAULT_ROWS_PER_PAGE, rows, limitSelectAll, canSelectRow);
                }
                catch (err) {
                    if (click !== clicks.current)
                        return;
                    setLoadingFrom(null);
                    // eslint-disable-next-line no-console
                    console.error("[Components-Care] [DataGrid] Select all: ", err);
                    if (onError)
                        onError(err);
                    return;
                }
                if (click !== clicks.current)
                    return;
                setLoadingFrom(null);
                const ids = result.rows.map((row) => row.id);
                setState((prevState) => {
                    // the grid shows another query since
                    if (prevState.refreshDataInstance !== refreshDataInstance)
                        return prevState;
                    const withRows = {
                        ...prevState,
                        rows: { ...result.loadedRows, ...prevState.rows },
                    };
                    // the selection changed since the click: the later choice stays
                    if (prevState.selectAll !== from.selectAll ||
                        prevState.selectedRows !== from.selectedRows)
                        return withRows;
                    return {
                        ...withRows,
                        selectAll: false,
                        selectedRows: ids,
                        limitedSelectAll: ids,
                        selectionUpdatedByProps: false,
                    };
                });
            })();
            return;
        }
        setLoadingFrom(null);
        // all or nothing: the rows (un)ticked one by one don't carry over, else
        // they would turn into the exceptions and invert the selection
        setState((prevState) => ({
            ...prevState,
            selectAll: newChecked,
            selectedRows: [],
            selectionUpdatedByProps: false,
        }));
    }, [
        limitSelectAll,
        loadData,
        search,
        customData,
        columnsState,
        getAdditionalFilters,
        rowsPerPage,
        rows,
        canSelectRow,
        onError,
        setState,
        refreshDataInstance,
        selectAll,
        selectedRows,
    ]);
    // until the selection changes, which makes it drop the rows it loads
    const busy = loadingFrom !== null &&
        loadingFrom.selectAll === selectAll &&
        loadingFrom.selectedRows === selectedRows;
    // the rows the limited select all selected, in any order: a row unticked and
    // ticked again moves to the end
    const limitedSelected = useMemo(() => {
        if (!limitedSelectAll ||
            selectedRows.length === 0 ||
            selectedRows.length !== limitedSelectAll.length)
            return false;
        if (selectedRows === limitedSelectAll)
            return true;
        const selected = new Set(selectedRows);
        return limitedSelectAll.every((id) => selected.has(id));
    }, [selectedRows, limitedSelectAll]);
    const checked = busy || (selectAll ? selectedRows.length === 0 : limitedSelected);
    const indeterminate = !checked && selectedRows.length > 0;
    const disabled = !enableSelectAll || !!prohibitMultiSelect;
    const limited = limitSelectAll !== undefined &&
        (state.rowsFiltered ?? state.rowsTotal) > limitSelectAll;
    const label = limited
        ? t("standalone.data-grid.footer.select-first", { NUM: limitSelectAll })
        : t("standalone.data-grid.footer.select-all");
    const value = useMemo(() => ({
        checked,
        indeterminate,
        busy,
        disabled,
        label,
        onSelect,
    }), [checked, indeterminate, busy, disabled, label, onSelect]);
    return (_jsx(DataGridSelectAllContext.Provider, { value: value, children: props.children }));
};
export default React.memo(SelectAllProvider);
