import React from "react";
import type { IDataGridExporter } from "./index";
import { MenuProps } from "@mui/material";
export interface IDataGridExportMenuEntryProps {
    /**
     * The exporter for this entry
     */
    exporter: IDataGridExporter<unknown>;
    /**
     * Close export menu
     */
    closeMenu: NonNullable<MenuProps["onClose"]>;
    /**
     * The element outside the menu that holds the entry's second status region
     * (see ExportMenuEntry). While it is null (before it mounted) the entry
     * renders only the region inside the menu.
     */
    statusContainer: HTMLElement | null;
}
export declare enum DataGridExportStatus {
    Idle = 0,
    Working = 1,
    Ready = 2,
    Error = 3
}
declare const _default: React.NamedExoticComponent<IDataGridExportMenuEntryProps & React.RefAttributes<HTMLLIElement>>;
export default _default;
