import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useEffect, useId, useState } from "react";
import { FormLabel, styled } from "@mui/material";
import DataGrid from "../../standalone/DataGrid/DataGrid";
import Connector from "../../backend-integration/Connector/Connector";
import { renderDataGridRecordUsingModel, useBackendDataGridRowLabel, } from "../DataGrid";
import { DataGridNoPersist } from "../../standalone";
import useCCTranslations from "../../utils/useCCTranslations";
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
/**
 * Multi selection as a DataGrid over a model, with a checkbox per row: a fieldset with the
 * label as its legend, the number of selected rows ("Selected: 2", a polite status that
 * also describes the field) and the grid, which fills the rest of the field's height. It
 * needs a parent with a height. Theme name for styleOverrides:
 * `CcBackendDataGridMultiSelect` (slots root, label, status, grid).
 */
const BackendDataGridMultiSelect = (props) => {
    const { model, readOnly, selected, onChange, label, getRowLabel: getRecordLabel, ...gridProps } = props;
    const getRowLabel = useBackendDataGridRowLabel(model, getRecordLabel);
    const { t } = useCCTranslations();
    const statusId = useId();
    const [refreshToken, setRefreshToken] = useState("");
    const refreshGrid = useCallback(() => setRefreshToken(new Date().toISOString()), []);
    const [initialSelectionChangeReceived, setInitialSelectionChangeReceived] = useState(false);
    // developer warning
    useEffect(() => {
        if (process.env.NODE_ENV === "development" &&
            model.connector.index2 === Connector.prototype.index2) {
            // eslint-disable-next-line no-console
            console.warn("[Components-Care] [DataGridMultiSelectCRUD] Backend connector does not support index2 function, offset based pagination will be emulated (inefficient)");
        }
    }, [model]);
    const grid = (_jsx(DataGridNoPersist, { children: _jsx(DataGrid, { ...gridProps, columns: model.toDataGridColumnDefinition(), forceRefreshToken: `${gridProps.forceRefreshToken || "undefined"}${refreshToken}`, disableSelection: false, prohibitMultiSelect: false, customSelectionControl: undefined, getRowLabel: getRowLabel, onSelectionChange: (invert, newIds) => {
                if (!initialSelectionChangeReceived) {
                    setInitialSelectionChangeReceived(true);
                    return;
                }
                onChange(readOnly ? [...selected] : newIds);
            }, selection: [false, selected], loadData: async (params) => {
                const [relationshipRecordsFiltered, relationshipRecordFilteredMeta] = selected.length > 0
                    ? await model.index({
                        ...params,
                        fieldFilter: {
                            ...params.fieldFilter,
                            id: {
                                type: "inSet",
                                value1: selected.join(","),
                                value2: "",
                            },
                        },
                    })
                    : [[], { totalRows: 0 }];
                const relationshipRecordFilteredCount = relationshipRecordFilteredMeta.filteredRows ??
                    relationshipRecordFilteredMeta.totalRows;
                const requestedOffset = (params.page - 1) * params.rows - relationshipRecordFilteredCount;
                const [dataRecords, dataMeta] = await model.index2({
                    ...params,
                    fieldFilter: {
                        ...params.fieldFilter,
                        id: {
                            type: "notInSet",
                            value1: selected.join(","),
                            value2: "",
                        },
                    },
                    offset: Math.max(requestedOffset, 0),
                    rows: Math.max(requestedOffset + params.rows, 0),
                });
                return {
                    rowsTotal: (dataMeta.filteredRows != null
                        ? selected.length
                        : relationshipRecordFilteredCount) + dataMeta.totalRows,
                    rowsFiltered: dataMeta.filteredRows != null
                        ? relationshipRecordFilteredCount + dataMeta.totalRows
                        : undefined,
                    rows: [...relationshipRecordsFiltered, ...dataRecords].map(renderDataGridRecordUsingModel(model, refreshGrid)),
                };
            } }) }));
    return (_jsxs(Root, { "aria-describedby": statusId, children: [label && _jsx(Label, { component: "legend", children: label }), _jsx(Status, { id: statusId, role: "status", children: t("backend-components.selector.selected-count", {
                    COUNT: selected.length,
                }) }), _jsx(GridSlot, { children: grid })] }));
};
export default React.memo(BackendDataGridMultiSelect);
