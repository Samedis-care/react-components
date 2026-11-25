import React from "react";
/**
 * Keys of the theme's `components.CcFormButtons.styleOverrides`, also the
 * keys of the `classes` prop:
 * - `root`: the bar, a Grid container
 * - `buttonWrapper`: the Grid item around each button
 *
 * No slot receives an `ownerState`: a function override is called with the
 * theme. FormButtons has no theme `variants`.
 */
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
/**
 * A bar of form action buttons, each in its own slot, in order. The buttons share
 * one line and wrap onto further lines when they do not fit, as on a 320px phone.
 */
declare const _default: React.MemoExoticComponent<(inProps: FormButtonsProps) => React.JSX.Element>;
export default _default;
