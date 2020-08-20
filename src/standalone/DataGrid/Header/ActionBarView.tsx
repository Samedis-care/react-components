import React, { useCallback, useState } from "react";
import { Grid, IconButton, MenuProps, Tooltip } from "@material-ui/core";
import {
	Add as AddIcon,
	Delete as DeleteIcon,
	Description as ExportIcon,
	Edit as EditIcon,
	Settings as SettingsIcon,
	SettingsBackupRestore as ResetIcon,
} from "@material-ui/icons";
import { VerticalDivider } from "../../index";
import { IDataGridExporter } from "./index";
import ExportMenu from "./ExportMenu";
import i18n from "../../../i18n";

export interface IDataGridActionBarViewProps {
	/**
	 * Callback to toggle the settings popover
	 */
	toggleSettings: () => void;
	/**
	 * The amount of selected items
	 * Values: 0 (none), 1 (one) or 2 (multiple)
	 */
	numSelected: number;
	/**
	 * Callback for add new button.
	 * If not defined: Disables add new button
	 */
	handleAddNew?: () => void;
	/**
	 * Callback for edit button.
	 * If not defined: Disables edit button
	 */
	handleEdit?: () => void;
	/**
	 * Callback for delete button.
	 * If not defined: Disables delete button
	 */
	handleDelete?: () => void;
	/**
	 * Callback for reset button
	 */
	handleReset: () => void;
	/**
	 * Does this grid have an custom filter bar?
	 */
	hasCustomFilterBar: boolean;
	/**
	 * List of available export providers
	 */
	exporters?: IDataGridExporter<any>[];
}

const ActionBarView = (props: IDataGridActionBarViewProps) => {
	const showDivider =
		props.handleAddNew || props.handleEdit || props.handleDelete;

	const [exportAnchorEl, setExportAnchorEl] = useState<MenuProps["anchorEl"]>(
		undefined
	);
	const openExportMenu = useCallback(
		(evt: React.MouseEvent) => {
			setExportAnchorEl(evt.currentTarget);
		},
		[setExportAnchorEl]
	);

	const closeExportMenu = useCallback(() => {
		setExportAnchorEl(null);
	}, [setExportAnchorEl]);

	return (
		<Grid container>
			{props.hasCustomFilterBar && (
				<Grid item key={"divider-1"}>
					<VerticalDivider />
				</Grid>
			)}
			{props.handleAddNew && (
				<Grid item key={"new"}>
					<Tooltip title={i18n.t("standalone.data-grid.header.new")!}>
						<span>
							<IconButton onClick={props.handleAddNew}>
								<AddIcon />
							</IconButton>
						</span>
					</Tooltip>
				</Grid>
			)}
			{props.handleEdit && (
				<Grid item key={"edit"}>
					<Tooltip title={i18n.t("standalone.data-grid.header.edit")!}>
						<span>
							<IconButton
								disabled={props.numSelected !== 1}
								onClick={props.handleEdit}
							>
								<EditIcon />
							</IconButton>
						</span>
					</Tooltip>
				</Grid>
			)}
			{props.handleDelete && (
				<Grid item key={"delete"}>
					<Tooltip title={i18n.t("standalone.data-grid.header.delete")!}>
						<span>
							<IconButton
								disabled={props.numSelected === 0}
								onClick={props.handleDelete}
							>
								<DeleteIcon />
							</IconButton>
						</span>
					</Tooltip>
				</Grid>
			)}
			{showDivider && (
				<Grid item key={"divider-2"}>
					<VerticalDivider />
				</Grid>
			)}
			{props.exporters && (
				<Grid item key={"export"}>
					<Tooltip title={i18n.t("standalone.data-grid.header.export")!}>
						<span>
							<IconButton onClick={openExportMenu}>
								<ExportIcon />
							</IconButton>
						</span>
					</Tooltip>
					<ExportMenu
						exporters={props.exporters}
						anchorEl={exportAnchorEl}
						onClose={closeExportMenu}
					/>
				</Grid>
			)}
			<Grid item key={"settings"}>
				<Tooltip title={i18n.t("standalone.data-grid.header.settings")!}>
					<span>
						<IconButton onClick={props.toggleSettings}>
							<SettingsIcon />
						</IconButton>
					</span>
				</Tooltip>
			</Grid>
			<Grid item key={"reset"}>
				<Tooltip
					title={i18n.t("standalone.data-grid.header.reset")!}
					onClick={props.handleReset}
				>
					<span>
						<IconButton>
							<ResetIcon />
						</IconButton>
					</span>
				</Tooltip>
			</Grid>
		</Grid>
	);
};

export default React.memo(ActionBarView);
