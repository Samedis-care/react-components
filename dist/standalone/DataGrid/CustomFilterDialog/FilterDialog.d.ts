import React from "react";
import { IDataGridFilterBarProps } from "../Header/FilterBar";
export interface DataGridCustomFilterDialogProps extends Omit<IDataGridFilterBarProps, "inDialog"> {
    /**
     * Callback to close custom filter pop-over
     */
    closeFilterDialog: () => void;
    /**
     * The component to render
     */
    customFilters: React.ComponentType<IDataGridFilterBarProps>;
}
declare const _default: React.MemoExoticComponent<(props: DataGridCustomFilterDialogProps) => React.JSX.Element>;
export default _default;
