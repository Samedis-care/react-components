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
}
export type CenteredTypographyClassKey = "root" | "inner" | "typography";
declare const _default: React.MemoExoticComponent<(inProps: CenteredTypographyProps) => React.JSX.Element>;
export default _default;
