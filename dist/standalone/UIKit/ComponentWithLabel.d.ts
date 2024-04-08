import React from "react";
import { FormControlLabelProps, TypographyProps } from "@mui/material";
export interface ComponentWithLabelProps extends Omit<FormControlLabelProps, "label"> {
    /**
     * The text of the label
     */
    labelText: string;
    /**
     * Label variant
     */
    labelVariant?: TypographyProps["variant"];
    /**
     * Label location
     */
    labelDisplay?: TypographyProps["display"];
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
}
export type ComponentWithLabelClassKey = "root" | "label";
declare const _default: React.MemoExoticComponent<(inProps: FormControlLabelProps | ComponentWithLabelProps) => React.JSX.Element>;
export default _default;
