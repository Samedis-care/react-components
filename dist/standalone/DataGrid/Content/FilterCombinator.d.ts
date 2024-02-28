import React from "react";
import { FilterComboType } from "./FilterEntry";
interface IProps {
    /**
     * The current filter combination type
     */
    value: FilterComboType;
    /**
     * Sets the filter combination type
     * @param value The new type
     */
    onChange: (value: FilterComboType) => void;
}
declare const _default: React.MemoExoticComponent<(props: IProps) => React.JSX.Element>;
export default _default;
