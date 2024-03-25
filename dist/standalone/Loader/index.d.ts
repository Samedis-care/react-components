import React from "react";
import { Variant } from "@mui/material/styles/createTypography";
export interface LoaderProps {
    /**
     * Optional status message to show
     */
    text?: string;
    /**
     * Typography variant to use for text
     */
    typographyVariant?: Variant;
}
export type LoaderClassKey = "outerWrapper" | "innerWrapper" | "outerProgressWrapper" | "innerProgressWrapper" | "progress";
declare const _default: React.MemoExoticComponent<(inProps: LoaderProps) => React.JSX.Element>;
export default _default;
