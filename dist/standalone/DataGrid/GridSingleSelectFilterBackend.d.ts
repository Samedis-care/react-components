import React from "react";
import { GridSize } from "@mui/material/Grid";
import { Breakpoint } from "@mui/material/styles";
import BackendSingleSelect, { BackendSingleSelectProps } from "../../backend-components/Selector/BackendSingleSelect";
import { ModelUnknown } from "../../backend-integration";
import { DistributiveOmit } from "../../utils/internal/distributiveOmit";
export type GridSingleSelectFilterBackendProps<M extends ModelUnknown> = DistributiveOmit<BackendSingleSelectProps<M>, "classes" | "className" | "disableClearable"> & {
    /**
     * Optional label for the filter
     */
    label?: string;
    /**
     * Non-optional selection handler
     */
    onSelect: NonNullable<BackendSingleSelectProps<M>["onSelect"]>;
    /**
     * Whether the filter is in the filter panel: pass
     * IDataGridFilterBarProps.inDialog. The panel shows the same selector
     * as the bar, sized by dialogBreakpoints instead of barBreakpoints.
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
};
export type GridSingleSelectFilterBackendClassKey = "dialogRoot" | "barRoot";
export declare const DataGridCustomFilterSingleBackend: typeof BackendSingleSelect;
declare const GridSingleSelectFilterBackend: <M extends ModelUnknown>(inProps: GridSingleSelectFilterBackendProps<M>) => React.JSX.Element;
declare const _default: typeof GridSingleSelectFilterBackend;
export default _default;
