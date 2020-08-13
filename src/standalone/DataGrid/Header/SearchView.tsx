import React, { ChangeEvent, useContext } from "react";
import { Box, InputAdornment, TextField } from "@material-ui/core";
import { Search as SearchIcon } from "@material-ui/icons";
import { DataGridPropsContext } from "../index";

const searchInputProps = {
	startAdornment: (
		<InputAdornment position="start">
			<SearchIcon />
		</InputAdornment>
	),
};

export interface IDataGridSearchViewProps {
	search: string;
	handleSearchChange: (evt: ChangeEvent<HTMLInputElement>) => void;
}

const SearchView = (props: IDataGridSearchViewProps) => {
	const gridProps = useContext(DataGridPropsContext)!;

	return (
		<Box ml={2}>
			<TextField
				value={props.search}
				onChange={props.handleSearchChange}
				placeholder={gridProps.searchPlaceholder}
				InputProps={searchInputProps}
				margin="dense"
			/>
		</Box>
	);
};

export default React.memo(SearchView);
