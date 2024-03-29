import React from "react";
import { useDataGridState } from "../DataGrid";
import PaginationView from "./PaginationView";

const Pagination = () => {
	const [state] = useDataGridState();

	return (
		<PaginationView
			rowsTotal={state.rowsTotal}
			rowsFiltered={state.rowsFiltered}
		/>
	);
};

export default React.memo(Pagination);
