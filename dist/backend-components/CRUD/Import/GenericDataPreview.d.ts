import React from "react";
import { DataGridProps, IDataGridColumnDef } from "../../../standalone/DataGrid/DataGrid";
export declare type GenericDataType = string | number | Date | null;
export interface GenericDataPreviewProps {
    /**
     * The generic data, should be a Record<string, GenericDataType>
     */
    data: Record<string, unknown>[];
    /**
     * Existing (partial) column definition
     */
    existingDefinition?: IDataGridColumnDef[];
    /**
     * Default filter settings
     */
    defaultFilter?: DataGridProps["defaultFilter"];
}
declare const _default: React.MemoExoticComponent<(props: GenericDataPreviewProps) => JSX.Element>;
export default _default;
