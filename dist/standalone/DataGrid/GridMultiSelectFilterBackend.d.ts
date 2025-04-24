import React from "react";
import { Breakpoint } from "@mui/material/styles";
import { GridSize } from "@mui/material/Grid2";
import { MultiSelectorData } from "../Selector";
import BackendMultipleSelect, { BackendMultipleSelectProps } from "../../backend-components/Selector/BackendMultipleSelect";
import { ModelFieldName, PageVisibility } from "../../backend-integration";
export interface GridMultiSelectFilterBackendProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData> extends Omit<BackendMultipleSelectProps<KeyT, VisibilityT, CustomT, DataT>, "classes"> {
    /**
     * Is the grid filter rendered in a dialog?
     */
    dialog: boolean;
    /**
     * Breakpoints used in dialog
     */
    dialogBreakpoints?: Partial<Record<Breakpoint, GridSize>>;
    /**
     * Breakpoints used in filter bar
     */
    barBreakpoints?: Partial<Record<Breakpoint, GridSize>>;
}
export declare const DataGridCustomFilterMultiBackend: typeof BackendMultipleSelect;
export type GridMultiSelectFilterBackendClassKey = "dialogRoot" | "barRoot";
declare const GridMultiSelectFilterBackend: <KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, DataT extends MultiSelectorData>(inProps: GridMultiSelectFilterBackendProps<KeyT, VisibilityT, CustomT, DataT>) => React.JSX.Element;
declare const _default: typeof GridMultiSelectFilterBackend;
export default _default;
