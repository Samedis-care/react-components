import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { Grid } from "@mui/material";
import { useDataGridColumnState, useDataGridProps, useDataGridState, } from "../DataGrid";
import DataActionBarView from "./DataActionBarView";
import { dataGridGetFilterParameters } from "../CallbackUtil";
import { isSelected } from "../Content/SelectRow";
const DataActionBar = () => {
    const [state, setState] = useDataGridState();
    const { search, customData, rows } = state;
    const [columnState] = useDataGridColumnState();
    const { getAdditionalFilters, customDataActionButtons, disableSelection, enableSelectAll, enableDeleteAll, disableDeleteHint, } = useDataGridProps();
    const { selectAll, selectedRows } = state;
    const { onEdit, onDelete } = useDataGridProps();
    const numSelected = selectAll
        ? (state.rowsFiltered ?? state.rowsTotal) - selectedRows.length
        : selectedRows.length;
    const firstSelection = selectAll
        ? Object.values(state.rows).find((row) => !selectedRows.includes(row.id))
            ?.id
        : selectedRows[0];
    const handleEdit = useCallback(() => {
        if (numSelected !== 1)
            return;
        if (!firstSelection)
            throw new Error("Calling handleEdit without selection? This shouldn't happen.");
        if (onEdit)
            onEdit(firstSelection);
    }, [numSelected, onEdit, firstSelection]);
    const handleDelete = useCallback(async () => {
        if (numSelected === 0)
            return;
        // without enableDeleteAll, onDelete may ignore invert and delete the ids
        if (selectAll && !enableDeleteAll)
            return;
        if (onDelete) {
            try {
                await onDelete(selectAll, selectedRows, dataGridGetFilterParameters({ search, customData }, columnState, getAdditionalFilters));
                setState((prevState) => ({
                    ...prevState,
                    selectAll: false,
                    selectedRows: [],
                }));
            }
            catch {
                // user cancelled
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
            rows: Object.values(rows).filter((row) => isSelected(selectAll, selectedRows, row)),
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
        rows,
    ]);
    return (_jsx(Grid, { container: true, children: _jsx(DataActionBarView, { numSelected: Math.min(numSelected, 2), selectAll: selectAll, handleEdit: onEdit ? handleEdit : undefined, handleDelete: onDelete ? handleDelete : undefined, enableDeleteAll: !!enableDeleteAll, disableDeleteHint: disableDeleteHint, customButtons: customDataActionButtons, handleCustomButtonClick: handleCustomButtonCLick, disableSelection: disableSelection || !enableSelectAll }) }));
};
export default React.memo(DataActionBar);
