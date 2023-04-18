import React from "react";
import { BaseSelectorData } from "../..";
import { GridSize } from "@mui/material/Grid/Grid";
import { Breakpoint } from "@mui/material/styles";
export interface GridSingleSelectFilterProps {
    /**
     * Optional label for the filter
     */
    label?: string;
    /**
     * All available options
     */
    options: BaseSelectorData[];
    /**
     * The currently selected option
     */
    selected: string | undefined;
    /**
     * Updates the currently selected options
     * @param selected The selected options
     */
    onSelect: (selected: string) => void;
    /**
     * Is the grid filter rendered in a dialog?
     */
    dialog: boolean;
    /**
     * Autocomplete ID passed to selector
     */
    autocompleteId?: string;
    /**
     * Default selection
     */
    defaultSelection: string;
    /**
     * Breakpoints used in dialog
     */
    dialogBreakpoints?: Partial<Record<Breakpoint, boolean | GridSize>>;
    /**
     * Breakpoints used in filter bar
     */
    barBreakpoints?: Partial<Record<Breakpoint, boolean | GridSize>>;
}
declare const _default: React.MemoExoticComponent<(props: GridSingleSelectFilterProps) => JSX.Element>;
export default _default;
