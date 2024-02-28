import React, { useCallback, useEffect, useState } from "react";
import DataGrid from "../../standalone/DataGrid/DataGrid";
import Connector from "../../backend-integration/Connector/Connector";
import { renderDataGridRecordUsingModel } from "../DataGrid";
import { DataGridNoPersist } from "../../standalone";
const BackendDataGridMultiSelect = (props) => {
    const { model, readOnly, selected, onChange, ...gridProps } = props;
    const [refreshToken, setRefreshToken] = useState(new Date().toISOString());
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
    // handle force refresh token
    useEffect(refreshGrid, [refreshGrid, gridProps.forceRefreshToken]);
    return (React.createElement(DataGridNoPersist, null,
        React.createElement(DataGrid, { ...gridProps, columns: model.toDataGridColumnDefinition(), forceRefreshToken: refreshToken, disableSelection: false, prohibitMultiSelect: false, customSelectionControl: undefined, onSelectionChange: (invert, newIds) => {
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
                    rows: relationshipRecordsFiltered
                        .concat(dataRecords)
                        .map(renderDataGridRecordUsingModel(model, refreshGrid)),
                };
            } })));
};
export default React.memo(BackendDataGridMultiSelect);
