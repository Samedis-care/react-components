import React from "react";
import { IDataGridExporter } from "./index";
import { IDataGridAddButton } from "../DataGrid";
import { ResetCallbacks } from "./ResetMenu";
export interface IDataGridActionBarViewProps extends ResetCallbacks {
    /**
     * Callback to toggle the settings popover
     */
    toggleSettings: () => void;
    /**
     * Callback for add new button.
     * If set to string: disabled add new button reason
     * If not defined: Disables add new button
     */
    handleAddNew?: (() => void) | string | IDataGridAddButton[];
    /**
     * Callback for import button click
     * If not defined: Disables import button
     */
    handleImport?: () => void;
    /**
     * Does this grid have an custom filter bar?
     */
    hasCustomFilterBar: boolean;
    /**
     * List of available export providers
     */
    exporters?: IDataGridExporter<unknown>[];
}
declare const _default: React.MemoExoticComponent<(props: IDataGridActionBarViewProps) => JSX.Element>;
export default _default;
