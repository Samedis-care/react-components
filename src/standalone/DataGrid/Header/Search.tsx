import React, { ChangeEvent, useCallback } from "react";
import { useDataGridState } from "../DataGrid";
import SearchView from "./SearchView";
import { styled } from "@mui/material";

const SearchViewStyled = styled(SearchView, {
	name: "CcDataGrid",
	slot: "search",
})({});

const Search = () => {
	const [state, setState] = useDataGridState();

	const handleSearchChange = useCallback(
		(evt: ChangeEvent<HTMLInputElement>) => {
			const newSearch = evt.target.value;
			setState((prevState) => ({
				...prevState,
				search: newSearch,
			}));
		},
		[setState],
	);

	return (
		<SearchViewStyled
			search={state.search}
			handleSearchChange={handleSearchChange}
		/>
	);
};

export default React.memo(Search);
