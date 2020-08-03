import React, { ChangeEvent, useCallback, useContext } from "react";
import { DataGridStateContext } from "../index";
import SearchView from "./SearchView";

export default React.memo(() => {
	const [state, setState] = useContext(DataGridStateContext)!;

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
});
