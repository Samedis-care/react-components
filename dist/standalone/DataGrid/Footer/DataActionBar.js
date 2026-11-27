import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useRef } from "react";
import { useDataGridColumnState, useDataGridProps, useDataGridSelectAll, useDataGridState, } from "../DataGrid";
import DataActionBarView from "./DataActionBarView";
import { dataGridGetFilterParameters } from "../CallbackUtil";
import { isSelected } from "../Content/SelectRow";
const DataActionBar = () => {
    const [state, setState] = useDataGridState();
    const { search, customData, rows } = state;
    // the loaded rows, read by the custom buttons' click handler when clicked,
    // so a page load doesn't re-create it and re-render the action bar
    const rowsRef = useRef(rows);
    rowsRef.current = rows;
    const [columnState] = useDataGridColumnState();
    const { getAdditionalFilters, customDataActionButtons, disableSelection, enableSelectAll, enableDeleteAll, disableDeleteHint, deleting, } = useDataGridProps();
    const { selectAll, selectedRows } = state;
    const { onEdit, onDelete } = useDataGridProps();
    const { label: selectAllLabel, disabled: selectAllDisabled } = useDataGridSelectAll();
    // with select all the rows matching the filter minus the ids: 0, not
    // negative, while the grid has no row count (a load runs or failed)
    const numSelected = selectAll
        ? Math.max((state.rowsFiltered ?? state.rowsTotal) - selectedRows.length, 0)
        : selectedRows.length;
    // the one selected row's id, for Edit. With select all it is the loaded
    // row that is not an exception: while that row is not loaded, the grid
    // doesn't know it, and Edit is disabled
    const editId = numSelected !== 1
        ? undefined
        : selectAll
            ? Object.values(state.rows).find((row) => !selectedRows.includes(row.id))?.id
            : selectedRows[0];
    const handleEdit = useCallback(() => {
        if (editId === undefined)
            return;
        if (onEdit)
            onEdit(editId);
    }, [onEdit, editId]);
    const handleDelete = useCallback(async () => {
        if (numSelected === 0)
            return;
        // without enableDeleteAll, onDelete may ignore invert and delete the ids
        if (selectAll && !enableDeleteAll)
            return;
        if (onDelete) {
            try {
                const deleted = await onDelete(selectAll, selectedRows, dataGridGetFilterParameters({ search, customData }, columnState, getAdditionalFilters));
                // nothing was deleted, e.g. the user cancelled a confirmation
                if (deleted === false)
                    return;
                setState((prevState) => ({
                    ...prevState,
                    selectAll: false,
                    selectedRows: [],
                    // reported also to a parent whose selection prop set it
                    selectionUpdatedByProps: false,
                }));
            }
            catch {
                // the selection stays
            }
        }
    }, [
        numSelected,
        onDelete,
        selectAll,
        enableDeleteAll,
        selectedRows,
        setState,
        search,
        columnState,
        getAdditionalFilters,
        customData,
    ]);
    const handleCustomButtonCLick = useCallback((label) => {
        if (!customDataActionButtons)
            return;
        const clickedButton = customDataActionButtons.find((entry) => entry.label === label);
        if (!clickedButton)
            return;
        clickedButton.onClick(selectAll, selectedRows, {
            filter: dataGridGetFilterParameters({ search, customData }, columnState, getAdditionalFilters),
            count: numSelected,
            rows: Object.values(rowsRef.current).filter((row) => isSelected(selectAll, selectedRows, row)),
        });
    }, [
        customDataActionButtons,
        selectAll,
        selectedRows,
        search,
        customData,
        columnState,
        getAdditionalFilters,
        numSelected,
    ]);
    return (_jsx(DataActionBarView, { numSelected: Math.min(numSelected, 2), selectAll: selectAll, handleEdit: onEdit ? handleEdit : undefined, editDisabled: editId === undefined, handleDelete: onDelete ? handleDelete : undefined, deleting: !!deleting, enableDeleteAll: !!enableDeleteAll, disableDeleteHint: disableDeleteHint, customButtons: customDataActionButtons, handleCustomButtonClick: handleCustomButtonCLick, disableSelection: disableSelection || !enableSelectAll, selectAllLabel: selectAllLabel, selectAllDisabled: selectAllDisabled }));
};
export default React.memo(DataActionBar);
