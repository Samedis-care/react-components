import React, { ChangeEvent } from "react";
export interface IDataGridSearchViewProps {
    /**
     * The current search input
     */
    search: string;
    /**
     * The search input change event handler
     * @param evt The change event
     */
    handleSearchChange: (evt: ChangeEvent<HTMLInputElement>) => void;
    /**
     * The box's placeholder. Default: DataGridProps.searchPlaceholder
     */
    placeholder?: string;
    /**
     * The box's accessible name: the field's aria-label and, below sm, the
     * name of the button that opens the field. Nothing visible renders it.
     * Default: no aria-label on the field, and "Search" (translated) for the
     * button
     */
    label?: string;
    /**
     * CSS class name
     */
    className?: string;
}
declare const _default: React.MemoExoticComponent<(props: IDataGridSearchViewProps) => React.JSX.Element>;
export default _default;
