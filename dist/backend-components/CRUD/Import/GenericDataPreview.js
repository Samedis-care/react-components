import React, { useMemo } from "react";
import filterSortPaginate from "../../../utils/filterSortPaginate";
import uniqueArray from "../../../utils/uniqueArray";
import { DataGrid, DataGridNoPersist } from "../../../standalone";
const GenericDataPreview = (props) => {
    const { data, existingDefinition, defaultFilter } = props;
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
                    rows: processed[0],
                };
            }, defaultFilter: defaultFilter })));
};
export default React.memo(GenericDataPreview);
