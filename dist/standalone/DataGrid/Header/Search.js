import React, { useCallback } from "react";
import { useDataGridState } from "../DataGrid";
import SearchView from "./SearchView";
import { styled } from "@mui/material";
const SearchViewStyled = styled(SearchView, {
    name: "CcDataGrid",
    slot: "search",
})({});
const Search = () => {
    const [state, setState] = useDataGridState();
    const { showSettings } = state;
    const handleSearchChange = useCallback((evt) => {
        const newSearch = evt.target.value;
        setState((prevState) => ({
            ...prevState,
            [showSettings ? "settingsSearch" : "search"]: newSearch,
        }));
    }, [setState, showSettings]);
    return (React.createElement(SearchViewStyled, { search: state[showSettings ? "settingsSearch" : "search"], handleSearchChange: handleSearchChange }));
};
export default React.memo(Search);
