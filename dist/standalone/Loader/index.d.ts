import React from "react";
export interface LoaderProps {
    /**
     * Optional status message to show
     */
    text?: string;
    /**
     * Custom styles
     */
    classes?: Partial<ReturnType<typeof useStyles>>;
}
declare const useStyles: (props?: any) => import("@mui/styles").ClassNameMap<"innerWrapper" | "outerWrapper" | "innerProgressWrapper" | "outerProgressWrapper">;
declare const _default: React.MemoExoticComponent<(props: LoaderProps) => JSX.Element>;
export default _default;
