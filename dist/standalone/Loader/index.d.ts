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
declare const useStyles: (props?: any) => import("@mui/styles").ClassNameMap<"innerProgressWrapper" | "innerWrapper" | "outerProgressWrapper" | "outerWrapper">;
declare const _default: React.MemoExoticComponent<(props: LoaderProps) => React.JSX.Element>;
export default _default;
