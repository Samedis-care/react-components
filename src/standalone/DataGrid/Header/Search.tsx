import React, { ChangeEvent, useCallback } from "react";
import { useDataGridState } from "../index";
import SearchView from "./SearchView";

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
		[setState]
	);

	return (
		<SearchView search={state.search} handleSearchChange={handleSearchChange} />
	);
};

export default React.memo(Search);
