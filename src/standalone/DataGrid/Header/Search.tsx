import React, { ChangeEvent, useCallback, useContext } from "react";
import { DataGridStateContext } from "../index";
import SearchView from "./SearchView";

const Search = () => {
	const stateCtx = useContext(DataGridStateContext);
	if (!stateCtx) throw new Error("State Context not set");
	const [state, setState] = stateCtx;

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
