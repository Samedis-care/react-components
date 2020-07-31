import React, { useCallback, useContext } from "react";
import { Grid, IconButton, Tooltip } from "@material-ui/core";
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Settings as SettingsIcon,
	Description as ExportIcon,
	SettingsBackupRestore as ResetIcon,
} from "@material-ui/icons";
import { VerticalDivider } from "../..";
import { DataGridStateContext } from "../index";

export default React.memo(() => {
	const [, setState] = useContext(DataGridStateContext)!;

	const toggleSettings = useCallback(() => {
		setState((prevState) => ({
			...prevState,
			showSettings: !prevState.showSettings,
		}));
	}, [setState]);

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
					<IconButton onClick={toggleSettings}>
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
