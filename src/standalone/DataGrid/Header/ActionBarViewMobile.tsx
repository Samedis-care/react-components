import React, { useCallback, useState } from "react";
import {
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	MenuProps,
	PopoverOrigin,
	Tooltip,
} from "@material-ui/core";
import {
	Add as AddIcon,
	Delete as DeleteIcon,
	Description as ExportIcon,
	Edit as EditIcon,
	Settings as SettingsIcon,
	SettingsBackupRestore as ResetIcon,
	Menu as MenuIcon,
} from "@material-ui/icons";
import ExportMenu from "./ExportMenu";
import i18n from "../../../i18n";
import { IDataGridActionBarViewProps } from "./ActionBarView";
import PopupMenu from "../../PopupMenu";

const anchorOrigin: PopoverOrigin = {
	vertical: "bottom",
	horizontal: "right",
};

const transformOrigin: PopoverOrigin = {
	vertical: "top",
	horizontal: "right",
};

const ActionBarViewMobile = (props: IDataGridActionBarViewProps) => {
	const showDivider =
		props.handleAddNew || props.handleEdit || props.handleDelete;

	const [mainMenuOpen, setMainMenuOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<MenuProps["anchorEl"]>(undefined);

	const openMainMenu = useCallback(
		(evt: React.MouseEvent) => {
			setMainMenuOpen(true);
			setAnchorEl(evt.currentTarget);
		},
		[setMainMenuOpen, setAnchorEl]
	);
	const openExportMenu = useCallback(() => {
		setMainMenuOpen(false);
	}, [setMainMenuOpen]);

	const closeMenu = useCallback(() => {
		setAnchorEl(null);
		setMainMenuOpen(false);
	}, [setAnchorEl, setMainMenuOpen]);

	return (
		<>
			<Tooltip title={i18n.t("standalone.data-grid.header.openMenu")!}>
				<IconButton onClick={openMainMenu}>
					<MenuIcon />
				</IconButton>
			</Tooltip>
			<PopupMenu
				elevation={0}
				anchorEl={anchorEl}
				anchorOrigin={anchorOrigin}
				transformOrigin={transformOrigin}
				keepMounted
				getContentAnchorEl={null}
				open={!!(anchorEl && mainMenuOpen)}
				onClose={closeMenu}
			>
				<List>
					{props.handleAddNew && (
						<ListItem key={"new"} button onClick={props.handleAddNew}>
							<ListItemIcon>
								<AddIcon />
							</ListItemIcon>
							<ListItemText>
								{i18n.t("standalone.data-grid.header.new")}
							</ListItemText>
						</ListItem>
					)}
					{props.handleEdit && (
						<ListItem
							key={"edit"}
							button
							onClick={props.handleEdit}
							disabled={props.numSelected !== 1}
						>
							<ListItemIcon>
								<EditIcon />
							</ListItemIcon>
							<ListItemText>
								{i18n.t("standalone.data-grid.header.edit")}
							</ListItemText>
						</ListItem>
					)}
					{props.handleDelete && (
						<ListItem
							key={"delete"}
							button
							onClick={props.handleDelete}
							disabled={props.numSelected === 0}
						>
							<ListItemIcon>
								<DeleteIcon />
							</ListItemIcon>
							<ListItemText>
								{i18n.t("standalone.data-grid.header.delete")}
							</ListItemText>
						</ListItem>
					)}
					{showDivider && <Divider key={"divider"} />}
					{props.exporters && (
						<ListItem key={"export"} button onClick={openExportMenu}>
							<ListItemIcon>
								<ExportIcon />
							</ListItemIcon>
							<ListItemText>
								{i18n.t("standalone.data-grid.header.export")}
							</ListItemText>
						</ListItem>
					)}
					<ListItem key={"settings"} button onClick={props.toggleSettings}>
						<ListItemIcon>
							<SettingsIcon />
						</ListItemIcon>
						<ListItemText>
							{i18n.t("standalone.data-grid.header.settings")}
						</ListItemText>
					</ListItem>
					<ListItem key={"reset"} button onClick={props.handleReset}>
						<ListItemIcon>
							<ResetIcon />
						</ListItemIcon>
						<ListItemText>
							{i18n.t("standalone.data-grid.header.reset")}
						</ListItemText>
					</ListItem>
				</List>
			</PopupMenu>
			{props.exporters && (
				<ExportMenu
					exporters={props.exporters}
					anchorEl={mainMenuOpen ? null : anchorEl}
					onClose={closeMenu}
				/>
			)}
		</>
	);
};

export default React.memo(ActionBarViewMobile);
