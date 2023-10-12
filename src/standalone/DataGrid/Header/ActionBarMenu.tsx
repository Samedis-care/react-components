import React, { useCallback } from "react";
import {
	ListItemIcon,
	MenuItem,
	MenuProps,
	PopoverOrigin,
} from "@mui/material";
import { ExportIcon, ResetIcon, TuneIcon } from "../../Icons";
import { Publish as ImportIcon } from "@mui/icons-material";
import PopupMenu from "../../PopupMenu";
import useCCTranslations from "../../../utils/useCCTranslations";

export interface ActionBarMenuProps {
	anchorEl: MenuProps["anchorEl"];
	toggleSettings?: (evt: React.MouseEvent) => void;
	openResetDialog?: (evt: React.MouseEvent) => void;
	openExportMenu?: (evt: React.MouseEvent) => void;
	handleImport?: (evt: React.MouseEvent) => void;
	onClose: () => void;
}

const anchorOrigin: PopoverOrigin = {
	vertical: "bottom",
	horizontal: "center",
};

const transformOrigin: PopoverOrigin = {
	vertical: "top",
	horizontal: "center",
};

const ActionBarMenu = (props: ActionBarMenuProps) => {
	const {
		anchorEl,
		onClose,
		toggleSettings,
		openResetDialog,
		openExportMenu,
		handleImport,
	} = props;
	const toggleSettingsWrap = useCallback(
		(evt: React.MouseEvent) => {
			if (toggleSettings) toggleSettings(evt);
			onClose();
		},
		[toggleSettings, onClose]
	);
	const openResetDialogWrap = useCallback(
		(evt: React.MouseEvent) => {
			if (openResetDialog) openResetDialog(evt);
			onClose();
		},
		[openResetDialog, onClose]
	);
	const openExportMenuWrap = useCallback(
		(evt: React.MouseEvent) => {
			if (openExportMenu) openExportMenu(evt);
			onClose();
		},
		[openExportMenu, onClose]
	);
	const handleImportWrap = useCallback(
		(evt: React.MouseEvent) => {
			if (handleImport) handleImport(evt);
			onClose();
		},
		[handleImport, onClose]
	);
	const { t } = useCCTranslations();
	return (
		<PopupMenu
			elevation={0}
			anchorEl={anchorEl}
			anchorOrigin={anchorOrigin}
			transformOrigin={transformOrigin}
			keepMounted
			open={!!anchorEl}
			onClose={onClose}
		>
			{toggleSettings && (
				<MenuItem onClick={toggleSettingsWrap}>
					<ListItemIcon>
						<TuneIcon fontSize={"small"} />
					</ListItemIcon>
					{t("standalone.data-grid.header.settings")}
				</MenuItem>
			)}
			{openResetDialog && (
				<MenuItem onClick={openResetDialogWrap}>
					<ListItemIcon>
						<ResetIcon fontSize={"small"} />
					</ListItemIcon>
					{t("standalone.data-grid.header.reset")}
				</MenuItem>
			)}
			{openExportMenu && (
				<MenuItem onClick={openExportMenuWrap}>
					<ListItemIcon>
						<ExportIcon fontSize={"small"} />
					</ListItemIcon>
					{t("standalone.data-grid.header.export")}
				</MenuItem>
			)}
			{handleImport && (
				<MenuItem onClick={handleImportWrap}>
					<ListItemIcon>
						<ImportIcon fontSize={"small"} />
					</ListItemIcon>
					{t("standalone.data-grid.header.import")}
				</MenuItem>
			)}
		</PopupMenu>
	);
};

export default React.memo(ActionBarMenu);
