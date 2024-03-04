import React from "react";
import { Breakpoint } from "@mui/material/styles";
import { GridSize } from "@mui/material/Grid/Grid";
import { MultiSelectorData } from "../Selector";
export interface GridMultiSelectFilterProps {
    /**
     * Optional label for the filter
     */
    label?: string;
    /**
     * All available options
     */
    options: MultiSelectorData[];
    /**
     * The currently selected options
     */
    selected: string[] | undefined;
    /**
     * Updates the currently selected options
     * @param selected The selected options
     */
    onSelect: (selected: string[]) => void;
    /**
     * Is the grid filter rendered in a dialog?
     */
    dialog: boolean;
    /**
     * Default selection
     */
    defaultSelection: string[];
    /**
     * Breakpoints used in dialog
     */
    dialogBreakpoints?: Partial<Record<Breakpoint, boolean | GridSize>>;
    /**
     * Breakpoints used in filter bar
     */
    barBreakpoints?: Partial<Record<Breakpoint, boolean | GridSize>>;
}
declare const _default: React.MemoExoticComponent<(props: GridMultiSelectFilterProps) => React.JSX.Element>;
export default _default;
