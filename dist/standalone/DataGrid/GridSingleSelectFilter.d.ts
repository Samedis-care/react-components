import React from "react";
import { BaseSelectorData } from "../../standalone/Selector";
import { GridSize } from "@mui/material/Grid";
import { Breakpoint } from "@mui/material/styles";
import SingleSelect from "../Selector/SingleSelect";
/**
 * Props of GridSingleSelectFilter
 */
export interface GridSingleSelectFilterProps {
    /**
     * The filter's label: the selector's label in the bar, a text above the
     * radios in the panel
     */
    label?: string;
    /**
     * All available options. There is no built-in "no filter" choice: add an
     * option for it (for example with the value "")
     */
    options: BaseSelectorData[];
    /**
     * The key of the grid's custom data this filter edits. Its value in
     * DataGridProps.defaultCustomData is the filter's default: shown while
     * selected is unset, and restored by "Reset filter". While the selection
     * differs from it (isDataGridCustomFilterActive: undefined, null and ""
     * count as unset), the bar outlines the filter.
     */
    field: string;
    /**
     * The selected option's value: the custom data's value of field.
     * undefined (and null) show the value of field in
     * DataGridProps.defaultCustomData, or no option if it has none.
     */
    selected: string | undefined;
    /**
     * Called with the picked option's value
     * @param selected The picked option's value
     */
    onSelect: (selected: string) => void;
    /**
     * Renders the filter panel's variant: pass IDataGridFilterBarProps.inDialog
     */
    dialog: boolean;
    /**
     * The id of the bar's input (SingleSelect autocompleteId); unused in the
     * panel
     */
    autocompleteId?: string;
    /**
     * Grid sizes of the root in the filter panel, merged over
     * `{ xs: 12, md: 6, lg: 3 }`
     */
    dialogBreakpoints?: Partial<Record<Breakpoint, GridSize>>;
    /**
     * Grid sizes of the root in the header's filter bar, merged over
     * `{ xs: 4 }`
     */
    barBreakpoints?: Partial<Record<Breakpoint, GridSize>>;
}
export declare const DataGridCustomFilterSingle: typeof SingleSelect;
export type GridSingleSelectFilterClassKey = "dialogRoot" | "barRoot";
declare const _default: React.MemoExoticComponent<(inProps: GridSingleSelectFilterProps) => React.JSX.Element>;
export default _default;
