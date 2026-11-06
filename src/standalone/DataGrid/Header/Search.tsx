import React, { ChangeEvent, useCallback } from "react";
import { useDataGridState } from "../DataGrid";
import SearchView from "./SearchView";
import { styled } from "@mui/material";
import useCCTranslations from "../../../utils/useCCTranslations";

const SearchViewStyled = styled(SearchView, {
	name: "CcDataGrid",
	slot: "search",
})({});

/**
 * The header's search box (theme slot `search`). It edits the grid search,
 * which reloads the grid 500ms after the last change. While the column
 * settings are open it edits their column search instead, which never
 * reloads, and its name and placeholder say "Search columns".
 */
const Search = () => {
	const [state, setState] = useDataGridState();
	const { t } = useCCTranslations();

	const { showSettings } = state;

	const handleSearchChange = useCallback(
		(evt: ChangeEvent<HTMLInputElement>) => {
			const newSearch = evt.target.value;
			setState((prevState) => ({
				...prevState,
				[showSettings ? "settingsSearch" : "search"]: newSearch,
			}));
		},
		[setState, showSettings],
	);

	// while the column settings are open, the box searches their columns
	const columnSearchLabel = showSettings
		? t("standalone.data-grid.settings.search")
		: undefined;

	return (
		<SearchViewStyled
			search={state[showSettings ? "settingsSearch" : "search"]}
			handleSearchChange={handleSearchChange}
			placeholder={columnSearchLabel}
			label={columnSearchLabel}
		/>
	);
};

export default React.memo(Search);
