import React from "react";
import { GridSize } from "@mui/material/Grid";
import { Breakpoint } from "@mui/material/styles";
import BackendSingleSelect, { BackendSingleSelectProps } from "../../backend-components/Selector/BackendSingleSelect";
import { ModelUnknown } from "../../backend-integration";
export interface GridSingleSelectFilterBackendProps<M extends ModelUnknown> extends Omit<BackendSingleSelectProps<M>, "classes" | "className" | "disableClearable"> {
    /**
     * Optional label for the filter
     */
    label?: string;
    /**
     * Non-optional selection handler
     */
    onSelect: NonNullable<BackendSingleSelectProps<M>["onSelect"]>;
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
declare const GridSingleSelectFilterBackend: <M extends ModelUnknown>(inProps: GridSingleSelectFilterBackendProps<M>) => React.JSX.Element;
declare const _default: typeof GridSingleSelectFilterBackend;
export default _default;
