import React from "react";
import { useDataGridState } from "../index";
import PaginationView from "./PaginationView";

const Pagination = () => {
	const [state] = useDataGridState();

	return <PaginationView rowsTotal={state.rowsTotal} />;
};

export default React.memo(Pagination);
