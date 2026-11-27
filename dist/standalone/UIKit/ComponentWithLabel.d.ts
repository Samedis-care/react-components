import React from "react";
import { FormControlLabelProps, TypographyProps } from "@mui/material";
export interface ComponentWithLabelProps extends Omit<FormControlLabelProps, "label"> {
    /**
     * The caption, as a plain string. It wraps at its spaces where it has less
     * room than its text needs (e.g. in a row of captioned buttons on a phone),
     * and a `"\n"` in it starts a new line (`white-space: pre-line`).
     */
    labelText: string;
    /**
     * Label variant
     */
    labelVariant?: TypographyProps["variant"];
    /**
     * Label location
     */
    labelDisplay?: "block" | "inline";
    /**
     * Label alignment
     */
    labelAlign?: TypographyProps["align"];
    /**
     * custom class name to apply to root
     */
    className?: string;
    /**
     * Custom styles
     */
    classes?: Partial<Record<ComponentWithLabelClassKey, string>>;
    /**
     * Called once per click on the control or on its caption (a keyboard
     * activation of the control is a click too), with that click; its
     * `currentTarget` is the `<label>` root. For a click on the caption, the
     * label then forwards a click to the control (it toggles a checkbox, it
     * clicks a button): that click doesn't call `onClick` again and is stopped
     * at the label if `onClick` stopped the first one. `preventDefault()` keeps
     * the label from forwarding the click.
     */
    onClick?: React.MouseEventHandler<HTMLLabelElement>;
}
/**
 * Keys of the theme's `components.CcComponentWithLabel.styleOverrides`, also
 * the keys of the `classes` prop:
 * - `root`: the `<label>` (MUI's FormControlLabel)
 * - `label`: the caption shown for `labelText`
 *
 * No slot receives an `ownerState`: a function override is called with the
 * theme. Theme `variants` style the root and match its props, which are all
 * of ComponentWithLabel's but `labelText`, `labelVariant`, `labelDisplay`
 * and `labelAlign`; a `props` function gets them directly.
 */
export type ComponentWithLabelClassKey = "root" | "label";
declare const _default: React.MemoExoticComponent<(inProps: ComponentWithLabelProps | FormControlLabelProps) => React.JSX.Element>;
export default _default;
