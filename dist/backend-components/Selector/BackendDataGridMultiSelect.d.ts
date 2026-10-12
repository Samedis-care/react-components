import React from "react";
import { ModelUnknown } from "../../backend-integration";
import { DataGridProps } from "../../standalone/DataGrid/DataGrid";
export interface BackendDataGridMultiSelectProps<M extends ModelUnknown> extends Omit<DataGridProps, "columns" | "loadData" | "disableSelection" | "prohibitMultiSelect" | "customSelectionControl" | "onSelectionChange" | "selection"> {
    /**
     * The model to load data from
     */
    model: M;
    /**
     * Selection read only?
     */
    readOnly?: boolean;
    /**
     * The current selection
     */
    selected: string[];
    /**
     * Selection change handler
     * @param selected The new selected IDS
     * @remarks May return the same ID array in a different array instance to force re-rendering (only read-only mode)
     */
    onChange: (selected: string[]) => void;
}
declare const BackendDataGridMultiSelect: <M extends ModelUnknown>(props: BackendDataGridMultiSelectProps<M>) => React.JSX.Element;
declare const _default: typeof BackendDataGridMultiSelect;
export default _default;
