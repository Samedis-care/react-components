import React, { ChangeEvent } from "react";
import { Box, InputAdornment, TextField } from "@material-ui/core";
import { Search as SearchIcon } from "@material-ui/icons";

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

export default React.memo((props: IDataGridSearchViewProps) => {
	return (
		<Box ml={2}>
			<TextField
				value={props.search}
				onChange={props.handleSearchChange}
				InputProps={searchInputProps}
				margin="dense"
			/>
		</Box>
	);
});
