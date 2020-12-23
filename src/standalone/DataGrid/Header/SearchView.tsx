import React, { ChangeEvent } from "react";
import { Box, InputAdornment, TextField } from "@material-ui/core";
import { Search as SearchIcon } from "@material-ui/icons";
import { useDataGridProps } from "../index";

const searchInputProps = {
	startAdornment: (
		<InputAdornment position="start">
			<SearchIcon />
		</InputAdornment>
	),
};

export interface IDataGridSearchViewProps {
	/**
	 * The current search input
	 */
	search: string;
	/**
	 * The search input change event handler
	 * @param evt The change event
	 */
	handleSearchChange: (evt: ChangeEvent<HTMLInputElement>) => void;
}

const SearchView = (props: IDataGridSearchViewProps) => {
	const { searchPlaceholder } = useDataGridProps();

	return (
		<Box ml={2}>
			<TextField
				value={props.search}
				onChange={props.handleSearchChange}
				placeholder={searchPlaceholder}
				InputProps={searchInputProps}
				margin={"dense"}
			/>
		</Box>
	);
};

export default React.memo(SearchView);
