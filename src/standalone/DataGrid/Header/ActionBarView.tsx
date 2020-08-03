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
	toggleSettings: () => void;
}

export default React.memo((props: IDataGridActionBarViewProps) => {
	return (
		<Grid container>
			<Grid item>
				<Tooltip title={"Create new"}>
					<IconButton>
						<AddIcon />
					</IconButton>
				</Tooltip>
			</Grid>
			<Grid item>
				<Tooltip title={"Edit selected"}>
					<IconButton>
						<EditIcon />
					</IconButton>
				</Tooltip>
			</Grid>
			<Grid item>
				<Tooltip title={"Delete selected"}>
					<IconButton>
						<DeleteIcon />
					</IconButton>
				</Tooltip>
			</Grid>
			<Grid item>
				<VerticalDivider />
			</Grid>
			<Grid item>
				<Tooltip title={"Export"}>
					<IconButton>
						<ExportIcon />
					</IconButton>
				</Tooltip>
			</Grid>
			<Grid item>
				<Tooltip title={"Settings"}>
					<IconButton onClick={props.toggleSettings}>
						<SettingsIcon />
					</IconButton>
				</Tooltip>
			</Grid>
			<Grid item>
				<Tooltip title={"Reset"}>
					<IconButton>
						<ResetIcon />
					</IconButton>
				</Tooltip>
			</Grid>
		</Grid>
	);
});
