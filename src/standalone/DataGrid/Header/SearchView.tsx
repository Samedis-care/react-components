import React, { ChangeEvent, useCallback, useState } from "react";
import {
	Box,
	Hidden,
	IconButton,
	InputAdornment,
	Popover,
	PopoverOrigin,
} from "@material-ui/core";
import { Search as SearchIcon } from "@material-ui/icons";
import { useDataGridProps, useDataGridStyles } from "../DataGrid";
import TextFieldWithHelp from "../../UIKit/TextFieldWithHelp";
import { combineClassNames } from "../../../utils";

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

const anchorOrigin: PopoverOrigin = {
	vertical: "bottom",
	horizontal: "center",
};
const transformOrigin: PopoverOrigin = {
	vertical: "top",
	horizontal: "center",
};

const SearchView = (props: IDataGridSearchViewProps) => {
	const { searchPlaceholder } = useDataGridProps();
	const classes = useDataGridStyles();
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const openPopover = useCallback(
		(evt: React.MouseEvent<HTMLElement>) => setAnchorEl(evt.currentTarget),
		[]
	);
	const closePopover = useCallback(() => setAnchorEl(null), []);

	const renderTextField = () => (
		<TextFieldWithHelp
			value={props.search}
			onChange={props.handleSearchChange}
			placeholder={searchPlaceholder}
			InputProps={{
				startAdornment: (
					<InputAdornment position="start">
						<SearchIcon
							className={combineClassNames([
								props.search && classes.quickFilterActiveIcon,
							])}
						/>
					</InputAdornment>
				),
			}}
			margin={"dense"}
		/>
	);

	return (
		<>
			<Hidden xsDown implementation={"js"}>
				{renderTextField()}
			</Hidden>
			<Hidden smUp implementation={"js"}>
				<IconButton
					onClick={openPopover}
					className={combineClassNames([
						props.search && classes.quickFilterActiveIcon,
					])}
				>
					<SearchIcon />
				</IconButton>
				<Popover
					open={anchorEl !== null}
					anchorEl={anchorEl}
					onClose={closePopover}
					anchorOrigin={anchorOrigin}
					transformOrigin={transformOrigin}
				>
					<Box p={1}>{renderTextField()}</Box>
				</Popover>
			</Hidden>
		</>
	);
};

export default React.memo(SearchView);
