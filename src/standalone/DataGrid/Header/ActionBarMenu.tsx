import React, { useCallback, useMemo } from "react";
import { flushSync } from "react-dom";
import {
	Divider,
	ListItemIcon,
	ListItemText,
	MenuItem,
	MenuItemProps,
	MenuProps,
	PopoverOrigin,
} from "@mui/material";
import { ExportIcon } from "../../Icons";
import {
	Add as AddIcon,
	Publish as ImportIcon,
	Refresh as RefreshIcon,
	Tune as TuneIcon,
} from "@mui/icons-material";
import PopupMenu from "../../PopupMenu";
import useCCTranslations from "../../../utils/useCCTranslations";
import type { IDataGridAddButton } from "../DataGrid";

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
	/**
	 * The add buttons the header has no room for (on phones every one but the
	 * first): an entry each, below the other entries, with its icon (MUI's Add
	 * by default) and label. An entry without onClick is disabled and shows its
	 * disableHint below the label.
	 */
	addButtons?: IDataGridAddButton[];
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
		addButtons,
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
	// "Reset" and "Export" open another menu. This menu closes first, so its
	// focus trap returns focus to the "More options" button before the other
	// menu opens: that menu then returns focus to the button when it closes,
	// instead of to this menu's entry, which is hidden by then
	const openResetDialogWrap = useCallback(
		(evt: React.MouseEvent) => {
			flushSync(onClose);
			if (openResetDialog) openResetDialog(evt);
		},
		[openResetDialog, onClose],
	);
	const openExportMenuWrap = useCallback(
		(evt: React.MouseEvent) => {
			flushSync(onClose);
			if (openExportMenu) openExportMenu(evt);
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
	const hasOtherEntries = !!(
		toggleSettings ||
		openResetDialog ||
		openExportMenu ||
		handleImport
	);
	return (
		<PopupMenu
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
			{hasOtherEntries && addButtons && addButtons.length > 0 && <Divider />}
			{addButtons?.map((entry, index) => (
				<MenuItem
					key={index.toString()}
					disabled={!entry.onClick}
					onClick={() => {
						if (entry.onClick) entry.onClick();
						onClose();
					}}
				>
					<ListItemIcon>
						{entry.icon ?? <AddIcon fontSize={"small"} />}
					</ListItemIcon>
					{!entry.onClick && entry.disableHint ? (
						<ListItemText primary={entry.label} secondary={entry.disableHint} />
					) : (
						entry.label
					)}
				</MenuItem>
			))}
		</PopupMenu>
	);
};

export default React.memo(ActionBarMenu);
