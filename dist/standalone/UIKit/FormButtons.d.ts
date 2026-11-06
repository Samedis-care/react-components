import React from "react";
export type FormButtonsClassKey = "root" | "buttonWrapper";
export interface FormButtonsProps {
    /**
     * The action buttons, each in its own slot, in order. Arrays are flattened, and
     * `null`, `undefined` and booleans get no slot, so conditional buttons can be
     * written inline (`{canDelete && <ActionButton … />}`). A slot is keyed by its
     * button's `key`, or by the button's position among the children, so a button
     * keeps its DOM node (and focus) when a conditional button before it
     * disappears. Buttons in an array need unique keys.
     */
    children: React.ReactNode | React.ReactNode[];
    /**
     * custom CSS class to apply to root
     */
    className?: string;
    /**
     * custom CSS classes to apply
     */
    classes?: Partial<Record<FormButtonsClassKey, string>>;
}
declare const _default: React.MemoExoticComponent<(inProps: FormButtonsProps) => React.JSX.Element>;
export default _default;
