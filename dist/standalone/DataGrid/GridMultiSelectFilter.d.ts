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
     * The filter's label: the select's label in the bar (and in the panel on a
     * phone), a text above the checkboxes in the panel
     */
    label?: string;
    /**
     * All available options. The bar and the panel treat them alike, as
     * BaseSelector does: an entry with hidden is not listed, one with
     * isDisabled is shown but cannot be ticked or unticked, a `[text, node]`
     * label shows its node, an isDivider entry is drawn as a separator and an
     * isSmallLabel entry as a text between the others. A selected hidden or
     * disabled value stays selected while the user changes the others.
     */
    options: MultiSelectorData[];
    /**
     * The key of the grid's custom data this filter edits. Its value in
     * DataGridProps.defaultCustomData is the filter's default: shown while
     * selected is unset, and restored by "Reset filter" and by the filter
     * panel's "Reset". While the selection has other entries
     * (isDataGridCustomFilterActive: in any order, undefined, null and [] count
     * as unset), the select is outlined, in the bar and in the panel on a
     * phone.
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
     * Whether the filter is in the filter panel: pass
     * IDataGridFilterBarProps.inDialog. The panel lists the options as
     * checkboxes, so one click ticks one. On a phone (the theme's xs
     * breakpoint) it shows the bar's multi-select instead, one row instead of
     * every option. Both are sized by dialogBreakpoints.
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
