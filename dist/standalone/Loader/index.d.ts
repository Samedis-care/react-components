import React from "react";
import { TypographyVariant } from "@mui/material/styles";
export interface LoaderProps {
    /**
     * Optional status message to show
     */
    text?: string;
    /**
     * Typography variant to use for text
     */
    typographyVariant?: TypographyVariant;
}
export type LoaderClassKey = "outerWrapper" | "innerWrapper" | "outerProgressWrapper" | "innerProgressWrapper" | "progress";
declare const _default: React.MemoExoticComponent<(inProps: LoaderProps) => React.JSX.Element>;
export default _default;
