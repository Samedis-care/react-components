import React from "react";
import { useDataGridState } from "../DataGrid";
import PaginationView from "./PaginationView";
var Pagination = function () {
    var state = useDataGridState()[0];
    return (React.createElement(PaginationView, { rowsTotal: state.rowsTotal, rowsFiltered: state.rowsFiltered }));
};
export default React.memo(Pagination);
