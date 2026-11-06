import React from "react";
import type { FilterComboType } from "./FilterEntry";
interface IProps {
    /**
     * The current filter combination type: the button of that word is pressed
     */
    value: FilterComboType;
    /**
     * Called with "and" or "or" when the user picks the other word (a click on
     * its button, or Space/Enter on it). Picking the pressed word again does not
     * call it.
     * @param value The new type
     */
    onChange: (value: FilterComboType) => void;
}
declare const _default: React.MemoExoticComponent<(props: IProps) => React.JSX.Element>;
export default _default;
