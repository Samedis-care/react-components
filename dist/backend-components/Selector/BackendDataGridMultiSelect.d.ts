/// <reference types="react" />
import { ModelFieldName, PageVisibility } from "../../backend-integration";
import { DataGridProps } from "../../standalone/DataGrid/DataGrid";
import Model from "../../backend-integration/Model/Model";
export interface BackendDataGridMultiSelectProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> extends Omit<DataGridProps, "columns" | "loadData" | "disableSelection" | "prohibitMultiSelect" | "customSelectionControl" | "onSelectionChange" | "selection"> {
    /**
     * The model to load data from
     */
    model: Model<KeyT, VisibilityT, CustomT>;
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
declare const _default: <KeyT extends string, VisibilityT extends PageVisibility, CustomT>(props: BackendDataGridMultiSelectProps<KeyT, VisibilityT, CustomT>) => JSX.Element;
export default _default;
