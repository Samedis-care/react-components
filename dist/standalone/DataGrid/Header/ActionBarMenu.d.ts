import React from "react";
import { MenuItemProps, MenuProps } from "@mui/material";
import type { IDataGridAddButton } from "../DataGrid";
/**
 * The props of the "More options" menu's slots: MUI Menu's `slotProps`, and
 * the "Reset" and "Export" entries
 */
export interface ActionBarMenuSlotProps extends NonNullable<MenuProps["slotProps"]> {
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
declare const _default: React.MemoExoticComponent<(props: ActionBarMenuProps) => React.JSX.Element>;
export default _default;
