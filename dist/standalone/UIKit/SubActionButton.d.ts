import React from "react";
import { ButtonProps } from "@mui/material";
/**
 * The `ownerState` of the `button` slot: two flags. A function in the
 * theme's `styleOverrides` gets it. A theme variant's `props` object matches
 * each key against the button's props (every SubActionButton prop but
 * `icon`, `small`, `disableDivider` and `children`, `fullWidth` as applied)
 * and against these flags; a `props` function gets the button's props and
 * these flags.
 */
export interface SubActionButtonOwnerState {
    /**
     * Whether the `small` prop is set
     */
    small: boolean;
    /**
     * Whether the `disableDivider` prop is set (`"true"` included)
     */
    disableDivider: boolean;
}
/**
 * Key of the theme's `components.CcSubActionButton.styleOverrides`:
 * `button`, the MUI `Button`, SubActionButton's only slot. A function
 * override gets its {@link SubActionButtonOwnerState}. Theme `variants` style
 * the button too.
 */
export type SubActionButtonClassKey = "button";
export interface SubActionButtonProps extends Omit<ButtonProps, "children"> {
    /**
     * The icon of the button
     */
    icon?: React.ReactNode;
    /**
     * Show the compact version of the button (only icon)
     */
    small?: boolean;
    /**
     * The text of the button (used for tooltip if small is true)
     */
    children: NonNullable<React.ReactNode>;
    /**
     * Flag to disable the top divider
     */
    disableDivider?: boolean | "true";
}
declare const _default: React.MemoExoticComponent<(inProps: SubActionButtonProps) => React.JSX.Element>;
export default _default;
