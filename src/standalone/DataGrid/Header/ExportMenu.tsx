import React from "react";
import type { IDataGridExporter } from "./index";
import { MenuProps, PopoverOrigin } from "@mui/material";
import ExportMenuEntry from "./ExportMenuEntry";
import PopupMenu from "../../PopupMenu";

export interface IDataGridExportMenuProps {
	/**
	 * List of available export providers
	 */
	exporters: IDataGridExporter<unknown>[];
	/**
	 * The menu anchor
	 */
	anchorEl: MenuProps["anchorEl"];
	/**
	 * The menu onClose handler
	 */
	onClose: NonNullable<MenuProps["onClose"]>;
	/**
	 * The props of the menu's slots, MUI Menu's `slotProps`; `list` gives the
	 * menu an id and names it by the element that opened it (see useMenuButton)
	 */
	slotProps?: MenuProps["slotProps"];
}

const anchorOrigin: PopoverOrigin = {
	vertical: "bottom",
	horizontal: "center",
};

const transformOrigin: PopoverOrigin = {
	vertical: "top",
	horizontal: "center",
};

const ExportMenu = (props: IDataGridExportMenuProps) => {
	return (
		<PopupMenu
			anchorEl={props.anchorEl}
			anchorOrigin={anchorOrigin}
			transformOrigin={transformOrigin}
			keepMounted
			open={!!props.anchorEl}
			onClose={props.onClose}
			slotProps={props.slotProps}
		>
			{props.exporters.map((exporter) => (
				<ExportMenuEntry
					key={exporter.id}
					exporter={exporter}
					closeMenu={props.onClose}
				/>
			))}
		</PopupMenu>
	);
};

export default React.memo(ExportMenu);
