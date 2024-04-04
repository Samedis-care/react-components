import React, { useMemo } from "react";
import filterSortPaginate from "../../../utils/filterSortPaginate";
import uniqueArray from "../../../utils/uniqueArray";
import { DataGrid, DataGridNoPersist } from "../../../standalone";
import throwError from "../../../utils/throwError";
import { ModelVisibilityGridView, } from "../../../backend-integration";
const GenericDataPreview = (props) => {
    const { model, data, existingDefinition, defaultFilter } = props;
    const columns = useMemo(() => uniqueArray(data.map(Object.keys).flat()), [data]);
    const columnDef = useMemo(() => columns.map((column) => existingDefinition?.find((entry) => entry.field === column) ?? {
        field: column,
        headerName: column,
        type: "string",
        hidden: false,
        filterable: true,
        sortable: true,
        isLocked: false,
    }), [existingDefinition, columns]);
    const rowData = useMemo(() => data.map((entry, index) => ({
        id: index.toString(16),
        ...entry,
    })), [data]);
    return (React.createElement(DataGridNoPersist, null,
        React.createElement(DataGrid, { columns: columnDef, disableSelection: true, loadData: (params) => {
                const processed = filterSortPaginate(rowData, params, columnDef);
                return {
                    rowsTotal: rowData.length,
                    rowsFiltered: processed[1],
                    rows: model
                        ? processed[0].map((entry) => Object.fromEntries(Object.entries(entry).map(([key, value]) => [
                            key,
                            key in model.fields
                                ? model.fields[key].type.render({
                                    label: model.fields[key].getLabel(),
                                    field: key,
                                    initialValue: value,
                                    value: value,
                                    visibility: ModelVisibilityGridView,
                                    values: entry,
                                    errorMsg: null,
                                    warningMsg: null,
                                    touched: false,
                                    setError: () => throwError("not supported"),
                                    setFieldValue: () => throwError("not supported"),
                                    handleBlur: () => throwError("not supported"),
                                    handleChange: () => throwError("not supported"),
                                    setFieldTouched: () => throwError("not supported"),
                                })
                                : value,
                        ])))
                        : processed[0],
                };
            }, defaultFilter: defaultFilter })));
};
export default React.memo(GenericDataPreview);
