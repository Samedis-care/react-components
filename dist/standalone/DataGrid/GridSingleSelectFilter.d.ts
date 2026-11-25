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
     * The filter's label: the select's label in the bar (and in the panel on a
     * phone), a text above the radios in the panel
     */
    label?: string;
    /**
     * All available options. There is no built-in "no filter" choice: add an
     * option for it (for example with the value ""). The bar and the panel
     * treat them alike, as BaseSelector does: an entry with hidden is not
     * listed, one with isDisabled is shown but cannot be picked, a
     * `[text, node]` label shows its node, an isDivider entry is drawn as a
     * separator and an isSmallLabel entry as a text between the others.
     */
    options: BaseSelectorData[];
    /**
     * The key of the grid's custom data this filter edits. Its value in
     * DataGridProps.defaultCustomData is the filter's default: shown while
     * selected is unset, and restored by "Reset filter" and by the filter
     * panel's "Reset". While the selection differs from it
     * (isDataGridCustomFilterActive: undefined, null and "" count as unset),
     * the select is outlined, in the bar and in the panel on a phone.
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
     * Whether the filter is in the filter panel: pass
     * IDataGridFilterBarProps.inDialog. The panel lists the options as radio
     * buttons, so one click picks one. On a phone (the theme's xs breakpoint)
     * it shows the bar's select instead, one row instead of every option. Both
     * are sized by dialogBreakpoints.
     */
    dialog: boolean;
    /**
     * The id of the bar's input (SingleSelect autocompleteId); unused in the
     * panel, also by its select on a phone
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
