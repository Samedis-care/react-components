import React from "react";
import { Breakpoint } from "@mui/material/styles";
import { GridSize } from "@mui/material/Grid";
import { MultiSelectorData } from "../Selector";
import BaseSelector from "../Selector/BaseSelector";
/**
 * Props of GridMultiSelectFilter
 */
export interface GridMultiSelectFilterProps {
    /**
     * The filter's label: the selector's label in the bar, a text above the
     * checkboxes in the panel
     */
    label?: string;
    /**
     * All available options
     */
    options: MultiSelectorData[];
    /**
     * The key of the grid's custom data this filter edits. Its value in
     * DataGridProps.defaultCustomData is the filter's default: shown while
     * selected is unset, and restored by "Reset filter". While the selection
     * has other entries (isDataGridCustomFilterActive: in any order, undefined,
     * null and [] count as unset), the bar outlines the filter.
     */
    field: string;
    /**
     * The selected option values: the custom data's value of field.
     * undefined (and null) show the value of field in
     * DataGridProps.defaultCustomData, or no selection if it has none.
     */
    selected: string[] | undefined;
    /**
     * Called with the complete new selection when the user adds or removes a
     * value
     * @param selected The selected option values
     */
    onSelect: (selected: string[]) => void;
    /**
     * Renders the filter panel's variant: pass IDataGridFilterBarProps.inDialog
     */
    dialog: boolean;
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
export declare const DataGridCustomFilterMulti: typeof BaseSelector;
export type GridMultiSelectFilterClassKey = "dialogRoot" | "barRoot";
declare const _default: React.MemoExoticComponent<(inProps: GridMultiSelectFilterProps) => React.JSX.Element>;
export default _default;
