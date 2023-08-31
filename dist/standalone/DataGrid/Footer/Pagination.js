import React from "react";
import { useDataGridState } from "../DataGrid";
import PaginationView from "./PaginationView";
const Pagination = () => {
    const [state] = useDataGridState();
    return (React.createElement(PaginationView, { rowsTotal: state.rowsTotal, rowsFiltered: state.rowsFiltered }));
};
export default React.memo(Pagination);
