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
     * CSS class name
     */
    className?: string;
}
declare const _default: React.MemoExoticComponent<(props: IDataGridSearchViewProps) => React.JSX.Element>;
export default _default;
