import React from "react";
import {
	ListItemIcon,
	MenuItem,
	MenuProps,
	PopoverOrigin,
} from "@material-ui/core";
import PopupMenu from "../../PopupMenu";
import { DataGridProps } from "../DataGrid";

export interface DataActionBarMenuProps {
	anchorEl: MenuProps["anchorEl"];
	customButtons: NonNullable<DataGridProps["customDataActionButtons"]>;
	onClose: () => void;
	numSelected: 0 | 1 | 2;
	handleCustomButtonClick: (label: string) => void;
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
		handleCustomButtonClick,
	} = props;
	return (
		<PopupMenu
			elevation={0}
			anchorEl={anchorEl}
			anchorOrigin={anchorOrigin}
			transformOrigin={transformOrigin}
			keepMounted
			getContentAnchorEl={null}
			open={!!anchorEl}
			onClose={onClose}
		>
			{customButtons.map((entry) => (
				<MenuItem
					key={entry.label}
					disabled={entry.isDisabled(numSelected)}
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
