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
export type CenteredTypographyClassKey = "root" | "inner" | "typography";
declare const _default: React.MemoExoticComponent<(inProps: CenteredTypographyProps) => React.JSX.Element>;
export default _default;
