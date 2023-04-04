var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { useMemo } from "react";
import { filterSortPaginate, uniqueArray } from "../../../utils";
import { DataGrid, DataGridNoPersist } from "../../../standalone";
var GenericDataPreview = function (props) {
    var data = props.data, existingDefinition = props.existingDefinition, defaultFilter = props.defaultFilter;
    var columns = useMemo(function () { return uniqueArray(data.map(Object.keys).flat()); }, [data]);
    var columnDef = useMemo(function () {
        return columns.map(function (column) {
            var _a;
            return (_a = existingDefinition === null || existingDefinition === void 0 ? void 0 : existingDefinition.find(function (entry) { return entry.field === column; })) !== null && _a !== void 0 ? _a : {
                field: column,
                headerName: column,
                type: "string",
                hidden: false,
                filterable: true,
                sortable: true,
                isLocked: false,
            };
        });
    }, [existingDefinition, columns]);
    var rowData = useMemo(function () {
        return data.map(function (entry, index) { return (__assign({ id: index.toString(16) }, entry)); });
    }, [data]);
    return (React.createElement(DataGridNoPersist, null,
        React.createElement(DataGrid, { columns: columnDef, disableSelection: true, loadData: function (params) {
                var processed = filterSortPaginate(rowData, params, columnDef);
                return {
                    rowsTotal: rowData.length,
                    rowsFiltered: processed[1],
                    rows: processed[0],
                };
            }, defaultFilter: defaultFilter })));
};
export default React.memo(GenericDataPreview);
