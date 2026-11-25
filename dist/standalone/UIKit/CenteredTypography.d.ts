import React from "react";
import { TypographyProps } from "@mui/material";
export interface CenteredTypographyProps extends Omit<TypographyProps, "className" | "classes"> {
    /**
     * CSS class to apply to root
     */
    className?: string;
    /**
     * Custom styles
     */
    classes?: Partial<Record<CenteredTypographyClassKey, string>>;
    /**
     * The element of the text, as on Typography: by default the `variant`
     * picks it, so `"h1"` to `"h6"` render headings. For a message that is not
     * a section title, pass `"p"` or `"div"` and keep the variant for its look.
     * A status or error message also needs `role` (`"status"`, `"alert"`) to be
     * announced by screen readers.
     */
    component?: React.ElementType;
}
/**
 * Keys of the theme's `components.CcCenteredTypography.styleOverrides`, also
 * the keys of the `classes` prop:
 * - `root`: the outer box
 * - `inner`: the box centred in it
 * - `typography`: the text
 *
 * No slot receives an `ownerState`: a function override is called with the
 * theme. CenteredTypography has no theme `variants`; to style the text of
 * one Typography variant, use a nested selector such as
 * `"& .MuiTypography-h6"` in `styleOverrides.root`.
 */
export type CenteredTypographyClassKey = "root" | "inner" | "typography";
declare const _default: React.MemoExoticComponent<(inProps: CenteredTypographyProps) => React.JSX.Element>;
export default _default;
