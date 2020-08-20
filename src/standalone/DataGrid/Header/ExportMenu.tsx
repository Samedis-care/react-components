import React from "react";
import { IDataGridExporter } from "./index";
import { Menu, MenuProps, PopoverOrigin, withStyles } from "@material-ui/core";
import ExportMenuEntry from "./ExportMenuEntry";

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

const MenuWithBorder = withStyles((theme) => ({
	paper: {
		border: `1px solid ${theme.palette.divider}`,
	},
}))(Menu);

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
		<MenuWithBorder
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
		</MenuWithBorder>
	);
};

export default React.memo(ExportMenu);
