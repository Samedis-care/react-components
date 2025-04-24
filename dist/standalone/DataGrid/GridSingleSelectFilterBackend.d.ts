import React from "react";
import { GridSize } from "@mui/material/Grid2";
import { Breakpoint } from "@mui/material/styles";
import BackendSingleSelect, { BackendSingleSelectProps } from "../../backend-components/Selector/BackendSingleSelect";
import { ModelFieldName, PageVisibility } from "../../backend-integration";
export interface GridSingleSelectFilterBackendProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> extends Omit<BackendSingleSelectProps<KeyT, VisibilityT, CustomT>, "classes" | "className" | "disableClearable"> {
    /**
     * Optional label for the filter
     */
    label?: string;
    /**
     * Non-optional selection handler
     */
    onSelect: NonNullable<BackendSingleSelectProps<KeyT, VisibilityT, CustomT>["onSelect"]>;
    /**
     * Is the grid filter rendered in a dialog?
     */
    dialog: boolean;
    /**
     * Autocomplete ID passed to selector
     */
    autocompleteId?: string;
    /**
     * Breakpoints used in dialog
     */
    dialogBreakpoints?: Partial<Record<Breakpoint, GridSize>>;
    /**
     * Breakpoints used in filter bar
     */
    barBreakpoints?: Partial<Record<Breakpoint, GridSize>>;
}
export type GridSingleSelectFilterBackendClassKey = "dialogRoot" | "barRoot";
export declare const DataGridCustomFilterSingleBackend: typeof BackendSingleSelect;
declare const GridSingleSelectFilterBackend: <KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT>(inProps: GridSingleSelectFilterBackendProps<KeyT, VisibilityT, CustomT>) => React.JSX.Element;
declare const _default: typeof GridSingleSelectFilterBackend;
export default _default;
