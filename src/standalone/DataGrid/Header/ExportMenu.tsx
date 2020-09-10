import React from "react";
import { IDataGridExporter } from "./index";
import { MenuProps, PopoverOrigin } from "@material-ui/core";
import ExportMenuEntry from "./ExportMenuEntry";
import PopupMenu from "../../PopupMenu";

export interface IDataGridExportMenuProps {
	/**
	 * List of available export providers
	 */
	exporters: IDataGridExporter<any>[];
	/**
	 * The menu anchor
	 */
	anchorEl: MenuProps["anchorEl"];
	/**
	 * The menu onClose handler
	 */
	onClose: MenuProps["onClose"];
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
			elevation={0}
			anchorEl={props.anchorEl}
			anchorOrigin={anchorOrigin}
			transformOrigin={transformOrigin}
			keepMounted
			getContentAnchorEl={null}
			open={!!props.anchorEl}
			onClose={props.onClose}
		>
			{props.exporters.map((exporter) => (
				<ExportMenuEntry key={exporter.id} exporter={exporter} />
			))}
		</PopupMenu>
	);
};

export default React.memo(ExportMenu);
