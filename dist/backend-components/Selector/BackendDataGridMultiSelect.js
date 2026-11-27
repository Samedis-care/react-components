import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useId, useReducer, useRef, useState } from "react";
import { FormLabel, styled } from "@mui/material";
import DataGrid from "../../standalone/DataGrid/DataGrid";
import Connector from "../../backend-integration/Connector/Connector";
import { renderDataGridRecordUsingModel, useBackendDataGridRowLabel, } from "../DataGrid";
import { DataGridNoPersist } from "../../standalone";
import useCCTranslations from "../../utils/useCCTranslations";
import toComparisonJson from "../../utils/toComparisonJson";
/**
 * The field: a fieldset named by the legend (label), described by the count of selected
 * rows, with the grid filling the rest of its height
 */
const Root = styled("fieldset", {
    name: "CcBackendDataGridMultiSelect",
    slot: "root",
})({
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minWidth: 0,
    margin: 0,
    padding: 0,
    border: 0,
});
const Label = styled(FormLabel, {
    name: "CcBackendDataGridMultiSelect",
    slot: "label",
})({
    padding: 0,
});
const Status = styled("div", {
    name: "CcBackendDataGridMultiSelect",
    slot: "status",
})(({ theme }) => ({
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
}));
const GridSlot = styled("div", {
    name: "CcBackendDataGridMultiSelect",
    slot: "grid",
})({
    flex: "1 1 auto",
    minHeight: 0,
});
/** canSelectRow of a read-only field: no row can be ticked or unticked */
const refuseRow = () => false;
/**
 * Multi selection as a DataGrid over a model, with a checkbox per row: a fieldset with the
 * label as its legend, the number of selected rows ("Selected: 2", a polite status that
 * also describes the field) and the grid, which fills the rest of the field's height. It
 * needs a parent with a height. Theme name for styleOverrides:
 * `CcBackendDataGridMultiSelect` (slots root, label, status, grid).
 */
const BackendDataGridMultiSelect = (props) => {
    const { model, readOnly, selected, onChange, label, getRowLabel: getRecordLabel, limitSelectAll, enableSelectAll, canSelectRow, ...gridProps } = props;
    const getRowLabel = useBackendDataGridRowLabel(model, getRecordLabel);
    const { t } = useCCTranslations();
    const statusId = useId();
    const [initialSelectionChangeReceived, setInitialSelectionChangeReceived] = useState(false);
    // renders the field again, which hands the grid `selected` again: a new selection
    // array, which the grid applies when its own selection differs
    const [, showSelected] = useReducer((renders) => renders + 1, 0);
    const { forceRefreshToken } = gridProps;
    /**
     * The selection the pages of the grid's current load are split by (the selected
     * records first, then the others), and that load: its query and refresh token. A tick
     * or an untick does not reload the grid, so the pages it loads later must be split
     * like the loaded ones to continue where they stopped; a new query or refresh token
     * starts a new load, split by the selection of its time. selectedMatches is how many
     * of those records match the load's query, null until a page of the load counted them.
     */
    const loadSplit = useRef(null);
    // developer warning
    useEffect(() => {
        if (process.env.NODE_ENV === "development" &&
            model.connector.index2 === Connector.prototype.index2) {
            // eslint-disable-next-line no-console
            console.warn("[Components-Care] [DataGridMultiSelectCRUD] Backend connector does not support index2 function, offset based pagination will be emulated (inefficient)");
        }
    }, [model]);
    const grid = (_jsx(DataGridNoPersist, { children: _jsx(DataGrid, { ...gridProps, columns: model.toDataGridColumnDefinition(), forceRefreshToken: forceRefreshToken, disableSelection: false, prohibitMultiSelect: false, customSelectionControl: undefined, 
            // the value lists ids, so select all selects the matching records by their
            // ids, all of them unless limitSelectAll bounds it, instead of the inverted
            // selection (everything except the ids), which the value can't hold
            limitSelectAll: limitSelectAll ?? Number.POSITIVE_INFINITY, 
            // read-only: the row checkboxes are disabled, a click on a row ticks
            // nothing, and there is no select all
            enableSelectAll: readOnly ? false : enableSelectAll, canSelectRow: readOnly ? refuseRow : canSelectRow, getRowLabel: getRowLabel, onSelectionChange: (invert, newIds) => {
                if (!initialSelectionChangeReceived) {
                    setInitialSelectionChangeReceived(true);
                    return;
                }
                // a change the grid still makes after the field turned read-only (a
                // select all that was loading, e.g. when the form started to save) is
                // not taken: the grid shows `selected` again
                if (readOnly) {
                    showSelected();
                    return;
                }
                onChange(newIds);
            }, selection: [false, selected], loadData: async (params) => {
                const load = toComparisonJson([
                    params.rows,
                    params.quickFilter,
                    params.sort,
                    params.fieldFilter,
                    params.additionalFilters,
                    forceRefreshToken,
                ]);
                if (loadSplit.current?.load !== load)
                    loadSplit.current = { load, selected, selectedMatches: null };
                const split = loadSplit.current;
                // the grid lists the selected matches, then the others: a page shows
                // the selected matches that fall on its rows (the inSet query, paged
                // like the grid) and fills the rest of its rows with the others, from
                // where the pages above it stopped
                const firstRow = (params.page - 1) * params.rows;
                let selectedRecords = [];
                let selectedMatches = split.selected.length > 0 ? split.selectedMatches : 0;
                // a page below the selected matches holds none of them: once a page
                // of this load counted them, it asks no inSet query
                if (selectedMatches == null || firstRow < selectedMatches) {
                    const [records, meta] = await model.index({
                        ...params,
                        fieldFilter: {
                            ...params.fieldFilter,
                            id: {
                                type: "inSet",
                                value1: split.selected.join(","),
                                value2: "",
                            },
                        },
                    });
                    selectedRecords = records;
                    selectedMatches = split.selectedMatches =
                        meta.filteredRows ?? meta.totalRows;
                }
                const selectedOnPage = Math.min(Math.max(selectedMatches - firstRow, 0), params.rows);
                const [dataRecords, dataMeta] = await model.index2({
                    ...params,
                    fieldFilter: {
                        ...params.fieldFilter,
                        id: {
                            type: "notInSet",
                            value1: split.selected.join(","),
                            value2: "",
                        },
                    },
                    offset: Math.max(firstRow - selectedMatches, 0),
                    rows: params.rows - selectedOnPage,
                });
                // a connector that reports filteredRows counts the whole collection (the
                // selected records included) in totalRows and the other matches in
                // filteredRows; one that doesn't counts the other matches in totalRows
                const reportsFiltered = dataMeta.filteredRows != null;
                const matchCount = selectedMatches + (dataMeta.filteredRows ?? dataMeta.totalRows);
                return {
                    rowsTotal: reportsFiltered ? dataMeta.totalRows : matchCount,
                    rowsFiltered: reportsFiltered ? matchCount : undefined,
                    rows: [...selectedRecords, ...dataRecords].map(renderDataGridRecordUsingModel(model)),
                };
            } }) }));
    return (_jsxs(Root, { "aria-describedby": statusId, children: [label && _jsx(Label, { component: "legend", children: label }), _jsx(Status, { id: statusId, role: "status", children: t("backend-components.selector.selected-count", {
                    COUNT: selected.length,
                }) }), _jsx(GridSlot, { children: grid })] }));
};
export default React.memo(BackendDataGridMultiSelect);
