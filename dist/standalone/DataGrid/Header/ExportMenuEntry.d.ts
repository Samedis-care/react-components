import React from "react";
import type { IDataGridExporter } from "./index";
export interface IDataGridExportMenuEntryProps {
    /**
     * The exporter for this entry
     */
    exporter: IDataGridExporter<unknown>;
}
export declare enum DataGridExportStatus {
    Idle = 0,
    Working = 1,
    Ready = 2,
    Error = 3
}
declare const _default: React.MemoExoticComponent<React.ForwardRefExoticComponent<IDataGridExportMenuEntryProps & React.RefAttributes<HTMLLIElement>>>;
export default _default;
