import React from "react";
import { DataGridProps, IDataGridColumnDef } from "../../../standalone/DataGrid/DataGrid";
import { ModelUnknown } from "../../../backend-integration";
export type GenericDataType = string | number | Date | null;
export interface GenericDataPreviewProps {
    /**
     * The model to render data with
     * @remarks Another model reloads the rows, as another data array does
     */
    model?: ModelUnknown;
    /**
     * The generic data, should be a Record<string, GenericDataType>
     * @remarks Another array reloads the rows (the search, filters and sort stay), so pass
     *          the same array while the rows stay the same (e.g. with useMemo)
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
