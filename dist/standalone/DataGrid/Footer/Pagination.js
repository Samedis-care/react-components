import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { useDataGridState } from "../DataGrid";
import PaginationView from "./PaginationView";
const Pagination = () => {
    const [state] = useDataGridState();
    return (_jsx(PaginationView, { rowsTotal: state.rowsTotal, rowsFiltered: state.rowsFiltered }));
};
export default React.memo(Pagination);
