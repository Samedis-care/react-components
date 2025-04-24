import React, { ChangeEvent, useCallback, useState } from "react";
import {
	Box,
	IconButton,
	InputAdornment,
	Popover,
	PopoverOrigin,
	useMediaQuery,
} from "@mui/material";
import { DataGridQuickFilterIcon, useDataGridProps } from "../DataGrid";
import TextFieldWithHelp from "../../UIKit/TextFieldWithHelp";
import combineClassNames from "../../../utils/combineClassNames";

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
	/**
	 * CSS class name
	 */
	className?: string;
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
	const { searchPlaceholder, classes } = useDataGridProps();
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const openPopover = useCallback(
		(evt: React.MouseEvent<HTMLElement>) => setAnchorEl(evt.currentTarget),
		[],
	);
	const closePopover = useCallback(() => setAnchorEl(null), []);

	const renderTextField = () => (
		<TextFieldWithHelp
			value={props.search}
			onChange={props.handleSearchChange}
			placeholder={searchPlaceholder}
			slotProps={{
				input: {
					startAdornment: (
						<InputAdornment position="start">
							<DataGridQuickFilterIcon
								className={combineClassNames([
									classes?.quickFilterIcon,
									props.search && "CcDataGrid-quickFilterActiveIcon",
								])}
							/>
						</InputAdornment>
					),
				},
			}}
			margin={"dense"}
		/>
	);

	const smDown = useMediaQuery((theme) => theme.breakpoints.down("sm"));

	return (
		<div className={combineClassNames([props.className, classes?.search])}>
			{!smDown ? (
				renderTextField()
			) : (
				<>
					<IconButton onClick={openPopover} size="large">
						<DataGridQuickFilterIcon
							className={combineClassNames([
								classes?.quickFilterIcon,
								props.search && "CcDataGrid-quickFilterActiveIcon",
							])}
						/>
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
				</>
			)}
		</div>
	);
};

export default React.memo(SearchView);
