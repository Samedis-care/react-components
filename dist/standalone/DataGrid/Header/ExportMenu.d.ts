import React from "react";
import { IDataGridExporter } from "./index";
import { MenuProps } from "@material-ui/core";
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
    onClose: MenuProps["onClose"];
}
declare const _default: React.MemoExoticComponent<(props: IDataGridExportMenuProps) => JSX.Element>;
export default _default;
