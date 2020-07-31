import React, { ChangeEvent, useCallback, useContext } from "react";
import { Box, InputAdornment, TextField } from "@material-ui/core";
import { Search as SearchIcon } from "@material-ui/icons";
import { DataGridStateContext } from "../index";

const searchInputProps = {
	startAdornment: (
		<InputAdornment position="start">
			<SearchIcon />
		</InputAdornment>
	),
};

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
		<Box ml={2}>
			<TextField
				value={state.search}
				onChange={handleSearchChange}
				InputProps={searchInputProps}
				margin="dense"
			/>
		</Box>
	);
});
