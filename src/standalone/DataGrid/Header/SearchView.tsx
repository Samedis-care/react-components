import React, {
	ChangeEvent,
	useCallback,
	useId,
	useMemo,
	useState,
} from "react";
import {
	Box,
	IconButton,
	InputAdornment,
	Popover,
	PopoverOrigin,
	PopoverProps,
	useMediaQuery,
} from "@mui/material";
import { DataGridQuickFilterIcon, useDataGridProps } from "../DataGrid";
import TextFieldWithHelp from "../../UIKit/TextFieldWithHelp";
import combineClassNames from "../../../utils/combineClassNames";
import useCCTranslations from "../../../utils/useCCTranslations";

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

/**
 * The search box: a text field with a search icon, placeholder
 * DataGridProps.searchPlaceholder. Below sm it is a "Search" icon button
 * that opens the field in a popover, outside the `search` slot's element. The
 * popover is a dialog named by the button, and its field takes focus when it
 * opens. Must be rendered inside a DataGrid (it reads the grid's props).
 */
const SearchView = (props: IDataGridSearchViewProps) => {
	const { searchPlaceholder, classes } = useDataGridProps();
	const { t } = useCCTranslations();
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const openPopover = useCallback(
		(evt: React.MouseEvent<HTMLElement>) => setAnchorEl(evt.currentTarget),
		[],
	);
	const closePopover = useCallback(() => setAnchorEl(null), []);
	const open = anchorEl !== null;
	const buttonId = useId();
	const popoverId = useId();
	// the popover is a modal dialog (focus trap, the page behind is hidden from
	// assistive technology), named by the button that opens it
	const popoverSlotProps = useMemo(
		(): PopoverProps["slotProps"] => ({
			paper: {
				id: popoverId,
				role: "dialog",
				"aria-modal": true,
				"aria-labelledby": buttonId,
			},
		}),
		[buttonId, popoverId],
	);

	const renderTextField = (autoFocus: boolean) => (
		<TextFieldWithHelp
			autoFocus={autoFocus}
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
				renderTextField(false)
			) : (
				<>
					<IconButton
						id={buttonId}
						onClick={openPopover}
						size="large"
						aria-label={t("standalone.data-grid.header.search")}
						aria-haspopup="dialog"
						aria-expanded={open}
						aria-controls={open ? popoverId : undefined}
					>
						<DataGridQuickFilterIcon
							className={combineClassNames([
								classes?.quickFilterIcon,
								props.search && "CcDataGrid-quickFilterActiveIcon",
							])}
						/>
					</IconButton>
					<Popover
						open={open}
						anchorEl={anchorEl}
						onClose={closePopover}
						anchorOrigin={anchorOrigin}
						transformOrigin={transformOrigin}
						slotProps={popoverSlotProps}
					>
						{/* the field takes focus when the popover opens, so typing goes straight in */}
						<Box sx={{ p: 1 }}>{renderTextField(true)}</Box>
					</Popover>
				</>
			)}
		</div>
	);
};

export default React.memo(SearchView);
