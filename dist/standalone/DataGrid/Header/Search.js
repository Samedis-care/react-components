import React, { useCallback } from "react";
import { useDataGridState } from "../DataGrid";
import SearchView from "./SearchView";
const Search = () => {
    const [state, setState] = useDataGridState();
    const handleSearchChange = useCallback((evt) => {
        const newSearch = evt.target.value;
        setState((prevState) => ({
            ...prevState,
            search: newSearch,
        }));
    }, [setState]);
    return (React.createElement(SearchView, { search: state.search, handleSearchChange: handleSearchChange }));
};
export default React.memo(Search);
