import React from "react";
import {
	ListItemIcon,
	MenuItem,
	MenuProps,
	PopoverOrigin,
} from "@mui/material";
import PopupMenu from "../../PopupMenu";
import { DataGridProps } from "../DataGrid";
import { dataGridIsCustomDataActionDisabled } from "../CallbackUtil";

export interface DataActionBarMenuProps {
	anchorEl: MenuProps["anchorEl"];
	customButtons: NonNullable<DataGridProps["customDataActionButtons"]>;
	onClose: () => void;
	numSelected: 0 | 1 | 2;
	selectAll: boolean;
	handleCustomButtonClick: (label: string) => void;
	/**
	 * The props of the menu's slots, MUI Menu's `slotProps`; `list` gives the
	 * menu an id and names it by the element that opened it (see useMenuButton)
	 */
	slotProps?: MenuProps["slotProps"];
}

const anchorOrigin: PopoverOrigin = {
	vertical: "top",
	horizontal: "center",
};

const transformOrigin: PopoverOrigin = {
	vertical: "top",
	horizontal: "center",
};

const DataActionBarMenu = (props: DataActionBarMenuProps) => {
	const {
		anchorEl,
		onClose,
		customButtons,
		numSelected,
		selectAll,
		handleCustomButtonClick,
		slotProps,
	} = props;
	return (
		<PopupMenu
			elevation={0}
			anchorEl={anchorEl}
			anchorOrigin={anchorOrigin}
			transformOrigin={transformOrigin}
			keepMounted
			open={!!anchorEl}
			onClose={onClose}
			slotProps={slotProps}
		>
			{customButtons.map((entry) => (
				<MenuItem
					key={entry.label}
					disabled={dataGridIsCustomDataActionDisabled(
						entry,
						numSelected,
						selectAll,
					)}
					onClick={() => {
						handleCustomButtonClick(entry.label);
						onClose();
					}}
				>
					<ListItemIcon>{entry.icon}</ListItemIcon>
					{entry.label}
				</MenuItem>
			))}
		</PopupMenu>
	);
};

export default React.memo(DataActionBarMenu);
