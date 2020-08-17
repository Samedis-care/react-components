import React from "react";
import { Grid, IconButton, Tooltip } from "@material-ui/core";
import {
	Add as AddIcon,
	Delete as DeleteIcon,
	Description as ExportIcon,
	Edit as EditIcon,
	Settings as SettingsIcon,
	SettingsBackupRestore as ResetIcon,
} from "@material-ui/icons";
import { VerticalDivider } from "../../index";

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
}

const ActionBarView = (props: IDataGridActionBarViewProps) => {
	const showDivider =
		props.handleAddNew || props.handleEdit || props.handleDelete;

	return (
		<Grid container>
			{props.handleAddNew && (
				<Grid item key={"new"}>
					<Tooltip title={"Create new"}>
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
					<Tooltip title={"Edit selected"}>
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
					<Tooltip title={"Delete selected"}>
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
				<Grid item key={"divider"}>
					<VerticalDivider />
				</Grid>
			)}
			<Grid item key={"export"}>
				<Tooltip title={"Export"}>
					<span>
						<IconButton>
							<ExportIcon />
						</IconButton>
					</span>
				</Tooltip>
			</Grid>
			<Grid item key={"settings"}>
				<Tooltip title={"Settings"}>
					<span>
						<IconButton onClick={props.toggleSettings}>
							<SettingsIcon />
						</IconButton>
					</span>
				</Tooltip>
			</Grid>
			<Grid item key={"reset"}>
				<Tooltip title={"Reset"} onClick={props.handleReset}>
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
