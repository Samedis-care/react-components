import React from "react";
import { IDataGridFilterBarProps } from "../Header/FilterBar";
export interface DataGridCustomFilterDialogProps extends Omit<IDataGridFilterBarProps, "inDialog"> {
    /**
     * Closes the panel ("Show results"). The picks are kept: they apply at
     * once, as in the bar.
     */
    closeFilterDialog: () => void;
    /**
     * Sets the custom data back to DataGridProps.defaultCustomData ("Reset").
     * The search and the column filters stay. Without it the panel has no
     * "Reset" (DataGridProps.hideReset).
     */
    resetCustomData?: () => void;
    /**
     * The component to render
     */
    customFilters: React.ComponentType<IDataGridFilterBarProps>;
}
declare const _default: React.MemoExoticComponent<(props: DataGridCustomFilterDialogProps) => React.JSX.Element>;
export default _default;
