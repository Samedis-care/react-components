import React, { useCallback, useMemo } from "react";
import {
	ListItemIcon,
	MenuItem,
	MenuItemProps,
	MenuProps,
	PopoverOrigin,
} from "@mui/material";
import { ExportIcon } from "../../Icons";
import {
	Publish as ImportIcon,
	Refresh as RefreshIcon,
	Tune as TuneIcon,
} from "@mui/icons-material";
import PopupMenu from "../../PopupMenu";
import useCCTranslations from "../../../utils/useCCTranslations";

/**
 * The props of the "More options" menu's slots: MUI Menu's `slotProps`, and
 * the "Reset" and "Export" entries
 */
export interface ActionBarMenuSlotProps extends NonNullable<
	MenuProps["slotProps"]
> {
	/**
	 * The props of the "Reset" entry, which opens the reset menu (see
	 * useMenuButton)
	 */
	resetItem?: Partial<MenuItemProps>;
	/**
	 * The props of the "Export" entry, which opens the export menu (see
	 * useMenuButton)
	 */
	exportItem?: Partial<MenuItemProps>;
}

export interface ActionBarMenuProps {
	anchorEl: MenuProps["anchorEl"];
	toggleSettings?: (evt: React.MouseEvent) => void;
	openResetDialog?: (evt: React.MouseEvent) => void;
	openExportMenu?: (evt: React.MouseEvent) => void;
	handleImport?: (evt: React.MouseEvent) => void;
	onClose: () => void;
	/**
	 * The props of the slots: the menu's (MUI Menu's `slotProps`; `list` gives
	 * the menu an id and names it by its button) and of the "Reset" and
	 * "Export" entries, which open the reset and export menus and name them
	 * (see useMenuButton)
	 */
	slotProps?: ActionBarMenuSlotProps;
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
		slotProps,
	} = props;
	const menuSlotProps = useMemo((): MenuProps["slotProps"] => {
		if (!slotProps) return undefined;
		// the entries are not slots of the Menu
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { resetItem, exportItem, ...menuSlots } = slotProps;
		return menuSlots;
	}, [slotProps]);
	const toggleSettingsWrap = useCallback(
		(evt: React.MouseEvent) => {
			if (toggleSettings) toggleSettings(evt);
			onClose();
		},
		[toggleSettings, onClose],
	);
	const openResetDialogWrap = useCallback(
		(evt: React.MouseEvent) => {
			if (openResetDialog) openResetDialog(evt);
			onClose();
		},
		[openResetDialog, onClose],
	);
	const openExportMenuWrap = useCallback(
		(evt: React.MouseEvent) => {
			if (openExportMenu) openExportMenu(evt);
			onClose();
		},
		[openExportMenu, onClose],
	);
	const handleImportWrap = useCallback(
		(evt: React.MouseEvent) => {
			if (handleImport) handleImport(evt);
			onClose();
		},
		[handleImport, onClose],
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
			slotProps={menuSlotProps}
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
				<MenuItem {...slotProps?.resetItem} onClick={openResetDialogWrap}>
					<ListItemIcon>
						<RefreshIcon fontSize={"small"} />
					</ListItemIcon>
					{t("standalone.data-grid.header.reset")}
				</MenuItem>
			)}
			{openExportMenu && (
				<MenuItem {...slotProps?.exportItem} onClick={openExportMenuWrap}>
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
