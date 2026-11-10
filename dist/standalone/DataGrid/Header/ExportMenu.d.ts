import React from "react";
import type { IDataGridExporter } from "./index";
import { MenuProps } from "@mui/material";
export interface IDataGridExportMenuProps {
    /**
     * List of available export providers
     */
    exporters: IDataGridExporter<unknown>[];
    /**
     * The menu anchor
     */
    anchorEl: MenuProps["anchorEl"];
    /**
     * The menu onClose handler
     */
    onClose: NonNullable<MenuProps["onClose"]>;
    /**
     * The props of the menu's slots, MUI Menu's `slotProps`; `list` gives the
     * menu an id and names it by the element that opened it (see useMenuButton)
     */
    slotProps?: MenuProps["slotProps"];
}
declare const _default: React.MemoExoticComponent<(props: IDataGridExportMenuProps) => React.JSX.Element>;
export default _default;
