import React from "react";
import { Breakpoint } from "@mui/material/styles";
import { GridSize } from "@mui/material/Grid";
import { MultiSelectorData } from "../Selector";
import BackendMultipleSelect, { BackendMultipleSelectProps } from "../../backend-components/Selector/BackendMultipleSelect";
import { ModelUnknown } from "../../backend-integration";
import { DistributiveOmit } from "../../utils/internal/distributiveOmit";
export type GridMultiSelectFilterBackendProps<M extends ModelUnknown, DataT extends MultiSelectorData> = DistributiveOmit<BackendMultipleSelectProps<M, DataT>, "classes"> & {
    /**
     * Whether the filter is in the filter panel: pass
     * IDataGridFilterBarProps.inDialog. The panel shows a selector with the
     * picked records listed below it (BackendMultiSelect). On a phone (the
     * theme's xs breakpoint) it shows the bar's selector instead
     * (BackendMultipleSelect). Both are sized by dialogBreakpoints.
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
};
export declare const DataGridCustomFilterMultiBackend: typeof BackendMultipleSelect;
export type GridMultiSelectFilterBackendClassKey = "dialogRoot" | "barRoot";
declare const GridMultiSelectFilterBackend: <M extends ModelUnknown, DataT extends MultiSelectorData>(inProps: GridMultiSelectFilterBackendProps<M, DataT>) => React.JSX.Element;
declare const _default: typeof GridMultiSelectFilterBackend;
export default _default;
