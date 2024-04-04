import React from "react";
import { DataGridProps, IDataGridColumnDef } from "../../../standalone/DataGrid/DataGrid";
import { Model, ModelFieldName, PageVisibility } from "../../../backend-integration";
export type GenericDataType = string | number | Date | null;
export interface GenericDataPreviewProps {
    /**
     * The model to render data with
     */
    model?: Model<ModelFieldName, PageVisibility, unknown>;
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
declare const _default: React.MemoExoticComponent<(props: GenericDataPreviewProps) => React.JSX.Element>;
export default _default;
