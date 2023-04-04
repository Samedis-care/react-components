import React from "react";
declare const useStyles: (props?: any) => import("@material-ui/styles").ClassNameMap<"root">;
export interface VerticalDividerProps {
    /**
     * Custom styles to apply
     */
    classes?: Partial<ReturnType<typeof useStyles>>;
}
declare const _default: React.MemoExoticComponent<(props: VerticalDividerProps) => JSX.Element>;
export default _default;
